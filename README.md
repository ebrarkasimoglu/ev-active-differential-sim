# EV Active Differential Simulator (Virtual E-Diff)

A browser-based EV handling simulator focused on **rear differential behavior**.  
Switch between **Open**, **Locked**, and **Adaptive (E-Diff)** modes and see how they change **yaw response**, **wheel slip**, and **left/right torque split** across different road friction levels.

This is a **learning + portfolio project**: the goal is clear, comparable behavior in real time — not OEM-grade vehicle calibration.

---


### Differential modes
- **OPEN**: baseline behavior; torque distribution does not actively correct slip between rear wheels.
- **LOCKED**: forces the rear wheels to behave more “together” (great for straight traction, tends to understeer in corners).
- **ADAPTIVE (E-DIFF)**: rule-based control that adjusts a *locking ratio* and torque bias to reduce slip and improve corner stability.

### Road surface presets
- **Dry Tarmac** (μ = 1.0)
- **Wet Asphalt** (μ = 0.6)
- **Snow / Ice** (μ = 0.3)

### Live visualization + telemetry
- Canvas rendering of the vehicle path with slip highlighting
- Real-time charts:
  - **Yaw Rate**
  - **Wheel Slip Ratio** (left / right)
- Torque split view (Nm) for **rear-left vs rear-right**
- On-screen stats (speed, lateral G)

---

## How to use (quick demo)
1. Pick a surface: **Dry → Wet → Snow**
2. Set **Steering** to ~`25–35°`
3. Set **Target Speed** to ~`70–90 km/h`
4. Toggle **OPEN → LOCKED → ADAPTIVE**
5. Watch:
   - which wheel starts slipping first
   - how yaw rate changes
   - how torque split reacts in ADAPTIVE mode

Tip: The difference becomes very obvious as μ drops (Wet/Snow).

---

## Simulation notes (simplified on purpose)
The simulator uses a lightweight 2D dynamics approximation built around:
- a fixed-step update loop (**dt ≈ 0.016 s**) for stable behavior
- lateral load transfer (outer wheel gains normal load in a turn)
- a friction-limited tire force idea (traction limited by **normal load × μ**)
- a simple “cruise-control style” throttle logic to approach the **Target Speed**

**Key idea:** this project is for *comparing* differential strategies, so the model is intentionally kept understandable and fast in the browser.

---

## Parameters (current defaults)
- Vehicle mass: **1500 kg**
- Wheelbase: **2.7 m**
- Track width: **1.6 m**
- Max total drive torque: **600 Nm**
- Tire radius: **0.3 m**

(These are easy to tweak if you want to run more aggressive/realistic scenarios.)

---

## Tech stack
- React + TypeScript
- Tailwind CSS
- HTML5 Canvas (rendering)
- Recharts (telemetry)
- Lucide React (icons)
- Vite (dev/build)


