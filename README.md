This is actively under development. Looking for contributors! 

I can be found in game or on Slack with username "NhanHo".

# TLDR : 
Implemented with a fancy process system. This can be used on a completely new account. Right now the features go up to "all the code needed for a RCL 4 room", proper mining and remote mining.


# How to try this out 

For your own safety, it's better to only try this in a completely new colony (ie. you just respawn) for now.

First, edit `config.example.json` and put in the appropriate infomation, then copy it to `config.json`

In screeps console, enter `RawMemory.set("{}")`. This will delete everything you have in your memory.

``` 
git clone https://github.com/NhanHo/ScreepsOS.git ScreepsOS
cd ScreepsOS
npm install 
./node_modules/.bin/typings install
./node_modules/.bin/gulp build #This will actually upload code to your account, use compile instead of build if you don't want that to happen

```

The code should now be deployed to your screeps account. Assuming that you have a spawn named `Spawn1` in a room, input `__("first-room E12N12")` will start a process that spawn creep and start trying to upgrade your room (change the room name to your room name). Note that this does NOT put down structure automatically, so you will have to do that on your own. 

The code for `first-room` process can be found in `src/components/processes/room/starter.ts`
It is recommended to use this process until RCL 4 before switching to the set of processes for high level room.
(More info to come with regard on how to transition to the normal room process for higher level room). 

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
- Remote mining
- Command line interface to manage your empire.

# TODO: All of the features below is planned to be implemented soon™

- A list of all available command lines (For the moment, check out `src/components/cli` directory. Every files is a command line that can be used in screeps's console)
- A construction process: since there is a limit of 100 construction sites allowed, we need something to manage the global construction sites.
- Path caching
- Extend mining to energy source
- Labs stuffs
- Boosting stuffs
- Source keeper mining
- Nuke defense
- Kernel: A better scheduler
- Kernel: proper handling of parent/child pid

NO attacking code will be released publicly, although defense code might.
