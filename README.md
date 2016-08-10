I can be found in game or on Slack with username "NhanHo".

Note that is this NOT the current code running on my main account in Screeps. Although I do plan to switch over when it reaches feature parity with my old code.

# An OS for [Screeps](https://www.screeps.com).

- Motivation can be found here (unfinished document): https://gist.github.com/NhanHo/02949ea3a148c583d57570a1600b4d85

# Process
- To implement a process, extends class `Process` and implemented the appropriate `run` function.
- A memory object is given to each process at `this.memory`, use this instead of the global Memory to facility proper cleanup.
- Figure out some way to start that process
# Implemented:

- Basic kernel
- Room starter code (multi purposes creeps for room < RCL 4) process
- Spawn process (with rudimentary priority)
- Mining process (with separate courier)
- Extensions filling process (unoptimized, fill any and all empty extensions)
- Invader shooting process: get all towers and shoot at

# TODO: All of the features below is planned to be implemented soon™

- Command line interface to manage your empire.
- A construction process: since there is a limit of 100 construction sites allowed, we need something to manage the global construction sites.
- Remote mining
- Path caching
- Extend mining to energy source
- Labs stuffs
- Boosting stuffs
- Source keeper mining
- Nuke defense
- Kernel: A better scheduler
- Kernel: proper handling of parent/child pid

NO attacking code will be released publicly, although defense code might.