import { SimulationParams, VehicleState } from '../types';
import { PHYSICS } from '../constants';

export const calculateNextState = (
  currentState: VehicleState,
  params: SimulationParams
): VehicleState => {
  const { steeringAngle, throttle, surfaceFriction, diffMode, targetSpeed } = params;
  
  // Convert target speed km/h to m/s
  const targetSpeedMs = targetSpeed / 3.6;
  
  // 1. Calculate Load Transfer (Simplified)
  // Higher speed + turning = weight shifts to outer wheel
  const turnRadius = Math.abs(PHYSICS.WHEELBASE / Math.tan(steeringAngle * (Math.PI / 180) + 0.001));
  const centrifugalForce = (PHYSICS.MASS * (currentState.speed ** 2)) / turnRadius;
  const loadTransfer = (centrifugalForce * (PHYSICS.TRACK_WIDTH / 2)) / PHYSICS.WHEELBASE; // Simplified height moment
  
  // Normal loads (Gravity + Weight Transfer)
  const staticLoad = (PHYSICS.MASS * 9.81) / 4; // per wheel roughly
  // If turning right (positive angle), load shifts to Left (Outer)
  const isRightTurn = steeringAngle > 0;
  
  const loadLeft = isRightTurn ? staticLoad + loadTransfer : staticLoad - loadTransfer;
  const loadRight = isRightTurn ? staticLoad - loadTransfer : staticLoad + loadTransfer;

  // 2. Traction Limits (Friction Circle limit)
  const maxTractionLeft = Math.max(0, loadLeft * surfaceFriction);
  const maxTractionRight = Math.max(0, loadRight * surfaceFriction);

  // 3. Differential Logic (The Core Task)
  const totalRequestedTorque = throttle * PHYSICS.MAX_TORQUE;
  
  let torqueLeft = 0;
  let torqueRight = 0;
  let lockingRatio = 0;

  // Calculate ideal kinematic speeds
  const omegaVehicle = currentState.speed / PHYSICS.TIRE_RADIUS;
  // Outer wheel travels further, Inner travels less
  const deltaOmega = (currentState.yawRate * PHYSICS.TRACK_WIDTH) / (2 * PHYSICS.TIRE_RADIUS);
  
  // Ideal speeds without slip
  // Turning Right: Left is Outer (+), Right is Inner (-)
  const idealOmegaLeft = omegaVehicle + (isRightTurn ? deltaOmega : -deltaOmega);
  const idealOmegaRight = omegaVehicle + (isRightTurn ? -deltaOmega : deltaOmega);

  if (diffMode === 'OPEN') {
    // Torque is equalized, limited by the weakest tire
    // If inner wheel slips, outer wheel torque is capped at inner wheel's limit
    const limit = Math.min(maxTractionLeft, maxTractionRight);
    // Apply torque. If requested > limit, we slip.
    torqueLeft = Math.min(totalRequestedTorque / 2, limit * 1.5); // Allow some spin
    torqueRight = Math.min(totalRequestedTorque / 2, limit * 1.5);
    lockingRatio = 0;
  } 
  else if (diffMode === 'LOCKED') {
    // Torque splits based on load, but speeds are forced equal
    // This causes drag on the outer wheel and slip on the inner
    torqueLeft = totalRequestedTorque * (loadLeft / (loadLeft + loadRight));
    torqueRight = totalRequestedTorque * (loadRight / (loadLeft + loadRight));
    lockingRatio = 1;
  } 
  else if (diffMode === 'ADAPTIVE') {
    // E-Diff Logic
    // 1. Detect Scenario
    const speedFactor = Math.min(currentState.speed / 10, 1);
    const steerFactor = Math.abs(steeringAngle) / 45;
    
    // Heuristic: More lock needed if high steering angle AND acceleration
    let targetLock = 0.1; // Base preload
    
    // If turning and accelerating, increase lock to transfer torque to outer wheel
    if (Math.abs(steeringAngle) > 5 && throttle > 0.1) {
       targetLock = 0.3 + (steerFactor * 0.4 * speedFactor);
       
       // If slippery, limit aggressiveness to prevent oversteer
       if (surfaceFriction < 0.5) targetLock = Math.min(targetLock, 0.5);
    }

    lockingRatio = targetLock;

    // Distribute torque based on locking ratio
    // L=0 -> 50/50, L=1 -> Load based distribution
    const openSplit = 0.5;
    const lockedSplitLeft = loadLeft / (loadLeft + loadRight);
    
    const alpha = lockingRatio;
    const splitLeft = (1 - alpha) * openSplit + alpha * lockedSplitLeft;
    
    torqueLeft = totalRequestedTorque * splitLeft;
    torqueRight = totalRequestedTorque * (1 - splitLeft);
  }

  // 4. Calculate Slip and Resulting Forces
  // Simple slip model: Torque applied vs Max Traction
  const excessLeft = Math.max(0, torqueLeft - maxTractionLeft);
  const excessRight = Math.max(0, torqueRight - maxTractionRight);
  
  // Slip ratio (visual mostly)
  const slipLeft = Math.min(1, excessLeft / (maxTractionLeft + 1));
  const slipRight = Math.min(1, excessRight / (maxTractionRight + 1));

  // Effective Propulsive Force (what actually moves the car)
  // If slipping, force is capped at traction limit (kinetic friction)
  const forceLeft = Math.min(torqueLeft, maxTractionLeft);
  const forceRight = Math.min(torqueRight, maxTractionRight);

  // 5. Vehicle Dynamics Update
  const totalForce = forceLeft + forceRight;
  const drag = PHYSICS.AIR_RESISTANCE * (currentState.speed ** 2);
  const netForce = totalForce - drag;
  
  // Acceleration
  const acceleration = netForce / PHYSICS.MASS;
  
  // Speed Update (with simple clamp for target speed logic)
  let newSpeed = currentState.speed + acceleration * PHYSICS.DT;
  if (throttle === 0) newSpeed *= 0.98; // Coasting friction
  
  // Cap speed at target if accelerating, but allow slowing down
  if (throttle > 0 && newSpeed > targetSpeedMs) {
      newSpeed = targetSpeedMs; // Cruise control effect
  }
  newSpeed = Math.max(0, newSpeed);

  // Yaw Rate Calculation (Bicycle model approx)
  // Ideally: v / R. 
  // Understeer effect: Reduced yaw if slipping heavily in Locked mode
  let effectiveSteering = steeringAngle * (Math.PI / 180);
  
  if (diffMode === 'LOCKED' && Math.abs(steeringAngle) > 10) {
      // Penalty to turning ability due to locked axle fighting the turn
      effectiveSteering *= 0.7; 
  } else if (diffMode === 'OPEN' && (slipLeft > 0.5 || slipRight > 0.5)) {
      // Penalty due to loss of drive on one side
      effectiveSteering *= 0.8;
  } else if (diffMode === 'ADAPTIVE') {
      // Torque vectoring bonus!
      // If outer wheel has more torque, it helps turn
      const torqueDiff = isRightTurn ? (torqueLeft - torqueRight) : (torqueRight - torqueLeft);
      if (torqueDiff > 0) {
          effectiveSteering *= 1.1; // "Turn-in" help
      }
  }

  const newYawRate = (newSpeed * Math.tan(effectiveSteering)) / PHYSICS.WHEELBASE;
  
  // Position Update
  const newHeading = currentState.heading + newYawRate * PHYSICS.DT;
  const newX = currentState.x + Math.cos(newHeading) * newSpeed * PHYSICS.DT * 10; // Scale for visual
  const newY = currentState.y + Math.sin(newHeading) * newSpeed * PHYSICS.DT * 10;

  return {
    x: newX,
    y: newY,
    heading: newHeading,
    speed: newSpeed,
    yawRate: newYawRate,
    slipLeft,
    slipRight,
    torqueLeft,
    torqueRight,
    rpmLeft: (newSpeed / PHYSICS.TIRE_RADIUS) * (60 / (2 * Math.PI)) * (1 + slipLeft),
    rpmRight: (newSpeed / PHYSICS.TIRE_RADIUS) * (60 / (2 * Math.PI)) * (1 + slipRight),
    lockingRatio,
    lateralG: (newSpeed ** 2) / Math.max(turnRadius, 1) / 9.81
  };
};
