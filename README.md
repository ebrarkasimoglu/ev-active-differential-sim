# EV Active Differential Simulator 

A high-fidelity virtual physics playground designed to visualize and compare differential behaviors in electric vehicles. This project simulates vehicle dynamics, tire slip, and torque vectoring logic in real-time directly in the browser.

##  Overview

Understanding how differentials affect vehicle handling at the limit can be abstract. This simulator provides an interactive environment to test and visualize three distinct differential strategies under varying surface conditions:

1.  **Open Differential:** Standard behavior. Torque follows the path of least resistance.
2.  **Locked Differential:** Forces equal wheel speed. Maximizes straight-line traction but induces understeer in corners.
3.  **Adaptive E-Diff (Torque Vectoring):** Active control logic that distributes torque dynamically to optimize yaw rate and minimize slip based on steering input and lateral Gs.

##  Key Features

*   **Real-time Physics Engine:** Custom 2D rigid-body physics calculating load transfer, lateral G-forces, and kinetic friction limits at 60fps.
*   **Live Visualization:** Canvas-based rendering of the vehicle path with dynamic coloring based on tire slip.
*   **Telemetry Dashboard:** Real-time scrolling charts for Yaw Rate and Wheel Slip Ratio.
*   **Dynamic Scenarios:** Test handling on Dry Tarmac ($\mu=1.0$), Wet Asphalt ($\mu=0.6$), or Snow/Ice ($\mu=0.3$).
*   **Torque Split Visualizer:** See exactly how the system distributes Newton-meters (Nm) between the rear wheels in real-time.

##  Technology Stack

Built with a focus on performance and type safety:

*   **Core:** React 19 + TypeScript
*   **Styling:** Tailwind CSS
*   **Visualization:** HTML5 Canvas API (Vehicle rendering) + Recharts (Telemetry)
*   **Icons:** Lucide React

##  Physics Model

The simulation implements a simplified vehicle dynamics model that considers:

*   **Ackermann Geometry:** Calculates the ideal kinematic speed difference between inner and outer wheels during a turn.
*   **Lateral Weight Transfer:** Simulates load shifting to the outer wheel during cornering, which increases available grip on that side.
*   **Friction Circle:** Traction is limited by normal load $\times$ surface friction coefficient.
*   **Control Logic:** The Adaptive mode uses a heuristic algorithm to apply "locking" torque based on throttle position, steering angle, and detected slip.

