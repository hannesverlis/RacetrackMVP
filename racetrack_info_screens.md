# racetrack info-screens

A local racetrack needs a system to control races and inform spectators. You'll create a real-time system so that everyone has the information they need, exactly when they need it.

## The situation
Beachside Racetrack is almost ready to open. They've just finished laying the asphalt, built a reception area, constructed a paddock and unveiled a spectator area. All the fittings and fixtures are secure, and the paint is drying nicely.

No surprises, but Beachside Racetrack is literally next to a beach in a very touristic area. This is great for attracting race drivers and spectators, but also means that there is high competition for hiring and retaining team members. Beachside Racetrack has therefore decided to utilize as much technology as possible to reduce their reliance on staff.

The racetrack requires a way to prepare the next race, control races and inform spectators. This is where you come in.

## Functional requirements
Beachside Racetrack are looking for an MVP. It should do the minimum to solve the biggest problems.

A Product Manager has spent some time at the racetrack, and performed some additional research. This is presented below as user stories, lightweight user personas and some additional commentary.

You'll need to develop something which solves the problems identified.

## User personas
There are many "users" who need problems solving for them. Since they will be referenced multiple times in the user stories, it's more efficient to centralize their definition.

### Employee:  somebody who is employed by Beachside Racetrack.
Safety Official: an employee who is responsible for controlling the race and ensuring safety. They are highly trained to perform their role. They must ensure that race drivers are briefed. They start the race, and observe to identify hazards and crashes. They take appropriate action to ensure that everyone is safe at all times. They are an on-the-go outdoor persona and cannot carry a large device.
Lap-line Observer: an employee who is responsible for recording when cars cross the lap line. This role can be performed by any employee, and does not require specialist training. This role will be removed once automatic lap timing equipment becomes operational. They sit in a static location: outside but covered. They need to transport the device to and from the lap-line observation point.
Flag Bearer: an employee who stands at specified positions around the circuit. They use different coloured flags to communicate safety instructions to race drivers. This role will be removed once the new system is installed.
Receptionist: an employee who is responsible for welcoming guests, and registering race drivers for race sessions. They work at the front desk and use a static computer.
Guest: any person who is present at Beachside Racetrack, but is not an employee.
Race driver: a guest who will take part in a race as a non-professional race driver.
Spectator: a guest who watches a race, or is interested in comparing driver performances.
## Additional Commentary
### Race Sessions
A race session is an instance of a race, where up to 8 race drivers try to get the fastest lap. The race finishes after 10 minutes, and the "winner" is the race driver who records the fastest lap time.

After the Safety Official has briefed the drivers, the timer is started and the race begins.

The cars set off from the pit lane once it is safe to do so. Each car is considered to start its first lap (lap 1) as it passes the lap line for the first time. Every time the car passes the lap line, the number of laps is incremented by 1, and the fastest lap time is updated if it is the fastest lap so far.

When the race finishes, the cars return to the pit lane.

### Race cars
Each race car is equal in performance, and is represented by a number. The number is painted on the car, and is displayed on lap times. The car is the tracked entity during races. Race driver performance is based on the car (I.e. the Lap-line Observer looks out for car numbers, not race drivers).

### Current Race Modes
During the race, a system of flags are used to communicate safety instructions to race drivers. The Flag Bearers wave flags to indicate the current race mode:

Safe: No flag.
Hazard: Yellow flag, drive slowly.
Danger: Red flag, stop driving.
Finish: Chequered flag, proceed to the pit lane.
### Configure upcoming races
As a Receptionist, I want to configure race sessions, so that it is clear who will race and when.

### Current process
For each race session, the Receptionist writes all of the drivers names on a sheet of paper. The sheet of paper is handed to the Safety Official.

### Desired process
The Receptionist must be able to:

See a list of upcoming race sessions.
Add/Remove race sessions.
Add/Remove/Edit race drivers. Only a name needs to be captured for each driver. The driver's name must be unique within each race session.
Past races are erased from the system for the MVP.

## Announce next race
As a race driver, I want to know when it is my turn to race, so that I can proceed to the paddock.

As a race driver, I want to know which car I am assigned to, so that I can see my individual lap times.

Current process
The Safety Official pins up the list which was written by the Receptionist, and writes car numbers next to each name.

Just before that session starts, the Safety Official calls out the drivers names so they can proceed to the paddock.

The race drivers check the list to see which car they'll drive.

Desired process
When the receptionist adds drivers to the race session, they are automatically assigned a car to drive. The system can implement any assignment logic.

Race drivers must be able to see a list of drivers for the next race session, as well as what cars they are assigned to drive.

### Start Race
As a Safety Official, I want to indicate that the race is safe to start, so that interested people can follow the progress.

Current Process
The Safety Official rings a bell and the drivers are allowed to begin. A handheld timer is started.

Desire Process
The Safety Official presses a button on their interface, which declares the race is starting. The following also happens:

The race mode is changed to "Safe"
The leader board changes to the current race.
The Next Race screen switches to the subsequent race session.
The Safety Official sees race mode controls.

### Control Race Modes
As a Safety Official, I want to communicate the current race mode to drivers, so that they drive appropriately for the conditions.

Current Process
The Safety Official radios the race mode to the flag bearers, so that they know which flag to wave.

Desired Process
The Safety Official has four buttons an their interface once the race starts.

The flag bearers will be replaced by screens around the track which will show a representation of the flag. The screens will be full screen, with no additional information.

Mode	Screen Display
Safe	Solid Green
Hazard	Solid Yellow
Danger	Solid Red
Finish	Chequered Black/White
### Finish Race
As a Safety Official, I want the race drivers to proceed back to the pit lane, so that they can safely exit their cars.

Current Process
Once the timer counts down to zero, the Safety Official radios "Finish race" to the Flag Bearers and the chequered flag is waved.

Desired Process
Once the timer counts down to zero, or the Safety Official finishes the race, the race mode is changed to "Finished".

The drivers see the chequered flag screen, and return to the pit lane.

Once the race mode changes to "Finished", it cannot be changed to any other mode.

### End Race Session
As a Safety Official, I want to declare that all race cars have returned to the pit lane, so that employees can safely move around the circuit.

Current Process
The Safety Official radios to indicate that all cars have returned to the pit lane.

Desired Process
Once the race is in Finish mode, and the cars have returned to the pit lane, the Safety Official can end the Session.

This queues up the next session on the Safety Official's interface, so that they can see which drivers to brief, and which cars the drivers are assigned to.

The race mode changes to "Danger".

The Next Race screen now displays the current session's drivers, and displays an extra message to tell them to proceed to the paddock.

Record lap times
As a Lap-line Observer, I want to describe when a car crosses the lap line, so that lap times can be computed.

Current Process
The Lap-line observer has one stopwatch for each car, and presses the "lap" button each time a car crosses the lap line. At the end of the race, they write down the fastest lap for each driver, and pins the times up in a guest area.

Desired Process
The Lap-line observer has been given a tablet which may be used in landscape or portrait. Their interface requires 1 button for each car which will be pressed as the respective car passes the lap-line. The button must simply have the car's number on it. As many cars cross the lap-line quickly and often, the buttons must be very hard to miss (they must occupy a large tappable area).

Cars can still cross the lap line when the race is in finish mode. The observer's display should show a message to indicate that the race session is ended once that has been declared by the Safety Official.

The buttons must not function after the race is ended. They should disappear or be visually disabled.

See lap times
As a Spectator, I want to see the fastest lap times for each Race Driver, so that I can compare performances.

Current Process
Spectators see the list pinned up by the Lap-Line observer at the end of the race, and have no real-time view of lap times.

Desired Process
Spectators can view a leader board, to see the fastest lap for each driver in real-time.

Spectators must be able to see:

A list of cars and drivers for the current race session, ordered by fastest lap time.
A timer showing the remaining time of the race session.
An indication of the flag status.
The last race session's lap times must be displayed until the next race session is safe to start. This enables drivers to see their lap times after the race has ended.
The fastest lap time for each car.
The current lap for each car.
Technology
Your server must be developed in Node.JS.

Your server must be run with npm start. When your server is run with npm run dev, the timer lasts for 1 minute instead of 10 minutes.

You are free to use any frontend technology for this task. You may make use of NodeJS packages for this task. Be careful, you cannot blame the packages if your application does not work.

You must use Socket.IO to power the real-time functionality.

All displays and interfaces must react in real time to the inputs by various employees and expiring timers. For example, when the race mode is changed, the flag displays must change in real time. The displays and interfaces must not rely on polling. The interfaces can make API calls only to establish a real-time connection, but must send all data as real-time messages.

Your application is not required to persist any information. I.e. if the server restarts, all data is lost. This is an MVP.

## Interfaces
Each interface is designed to target a particular persona. Each interface must be reachable via a route. You must find some way to expose your interfaces, so that each interface is accessible to many devices on different networks. There are many ways to achieve this.

Each interface must be accessible via a first level route.

The result will look something like 866ed777.ngrok.io/leaderboard and 866ed777.ngrok.io/next-race which will display the correct interface.

User interfaces
The employee interfaces are for managing race operations. These screens require an admin password to unlock. These are:

Interface	Persona	Route
Front Desk	Receptionist	/front-desk
Race Control	Safety Official	/race-control
Lap-line Tracker	Lap-line Observer	/lap-line-tracker
The public displays are 40-75 inch smart displays (monitors with web browsers) which are positioned in guest and race driver areas. Each public display interface must feature a button to launch full-screen mode.

Interface	Persona	Route
Leader Board	Guest	leader-board
Next Race	Race Driver	next-race
Race Countdown	Race Driver	race-countdown
Race Flag	Race Driver	race-flags
Security
As a Safety Official, I want to protect access to employee interfaces, so that only authorized people can control races.

Desired process
The employee interface must ask the user for an access key before the real-time connection is established. I.e. it must not be possible to configure races, issue safety commands or input lap times without inputting an access key.

Each interface must have its own access key, so that the key can be given to users who are suitably qualified for their roles.

The access keys must be set as environment variables before the server is started. The access key names are up to you.

Your server must not start unless the access keys are defined. You must implement some error handling and usage if the access keys are not set.

For example:

export receptionist_key=8ded6076
export observer_key=662e0f6c
export safety_key=a2d393bc
npm start
If an incorrect access key is entered in the user interface, the server must wait 500ms before responding. Some error message must be displayed to describe that the access key was not correct. The interface must re-prompt the user to enter an access key.

### Documentation
You must provide a README.md file at the root of your project, which describes how the system works.

It must detail:

How to start the server, including any environment variables which must be set.
It must have a user guide, which shows how to use the system. For example, with screenshots which describe how to configure a race.
# Extra requirements

## Persist data
Persist data, so that the server can be restarted without losing data, and reinstates the appropriate state.

## Allow receptionist to select cars
Instead of randomly allocating drivers to cars, allow the receptionist to define the cars drivers will race in ahead of time.

## Bonus functionality
You're welcome to implement other bonuses as you see fit. But anything you implement must not change the default functional behavior of your project.

You may use additional feature flags, command line arguments or separate builds to switch your bonus functionality on.

Resources
None

Useful links
Socket.IO
Node.JS
MVP.
Product Manager
User Stories,
User Personas


#Tests and acceptance criterias:

## Tests

Mandatory

    The README.md file at the root of the project describes how to launch the project.

The README.md file at the root of the project has a user guide, describing the core functionality of the user interfaces.

    The receptionist can see a list of upcoming races.

    The receptionist can delete an upcoming race.

    The receptionist can add new race sessions.

    The receptionist can add/edit/remove drivers from a race.

    It is not possible to have two drivers with the same name.

    Race sessions disappear from the Front Desk interface once it is safe to start.

    The race drivers cannot be edited after the race is safe to start.

    The upcoming race session, is displayed on the Next Race display.

    The Next Race display switches to the subsequent race, once the current race is safe to start.

    The Next Race display shows the drivers names, and the cars they're assigned to.

    If there are no upcoming races, no sessions are displayed.

    If there is no upcoming race after the last session is ended, the Safety Official sees no upcoming races message.

    The safety official has one active button, which starts the race when pressed.

    When the race is started, the following happens:

- The race mode is changed to "Safe"
- The leader board changes to the current race.
- The Next Race screen switches to the subsequent race session.
- The Safety Official sees race mode controls.

    When the Safety Official selects "Safe", the Flag screen is green.

    When the Safety Official selects "Hazard", the Flag screen is yellow.

    When the Safety Official selects "Danger", the Flag screen is red.

    When the Safety Official selects "Finish", the Flag screen is chequered.

    When the race mode changes to "Finish", the race controls disappear, and a button appears to end the race session.

    When the Safety Official ends the race session, the next session appears on their interface.

    When the race session is ended, the Next Race display shows an additional message to proceed to the paddock.

    When the race session is ended, the race mode changes to "Danger".

    When the race session starts, the Lap-Line Observer sees a button for each car.

    The lap button for each car has a large tappable area.

    When the lap button is pressed for a car, the leader board is updated.

    The buttons disappear or are visibly disabled between races.

    The leaderboard shows the fastest lap time for each car.

    The leaderboard is ordered by fastest lap times.

    The leaderboard shows the current lap for each car.

The first lap starts when the car crosses the leader board for the first time.

    The leaderboard shows the drivers name and car number.

    The leaderboard shows the remaining time on the timer.

    The leaderboard shows the flag color for the current race mode.

    The server is written in Node.JS.

    Communication between interfaces is in real-time. API calls must not be used to send data.

For example, when the race mode is changed by the Safety Official, the flag displays change in real time.

    Communication between interfaces utilises messages sent via Socket.IO.

    Communication between the interfaces certainly does not use a polling convention.

    The server can be started with npm start.

    The server can be started in developer mode with npm run dev.

The countdown timer runs for 1 minute instead on 10 minutes.

    The countdown timer is 1 minute in dev mode (instead of 10 minutes).

    The interfaces are reachable by devices on other networks (not just localhost).

The interfaces must be reachable by devices on other networks. For example, the interface must be reachable from a mobile phone browser, while the server and interfaces are served from a computer.

    The interfaces are reachable via their correct paths.


| Interface        | Persona           | Route               |
| ---------------- | ----------------- | ------------------- |
| Front Desk       | Receptionist      | `/front-desk`       |
| Race Control     | Safety Official   | `/race-control`     |
| Lap-line Tracker | Lap-line Observer | `/lap-line-tracker` |
| Leader Board     | Guest             | `leader-board`      |
| Next Race        | Race Driver       | `next-race`         |
| Race Countdown   | Race Driver       | `race-countdown`    |
| Race Flag        | Race Driver       | `race-flags`        |

    The Race Control interface is designed for a mobile interface.

    The Lap-line Tracker is designed for a tablet, featuring large tappable buttons for each car.

It should work in Landscape or Portrait.

    The server will not start unless environment variables are set for interface access keys.

    The environment variable access codes match the accepted access codes entered into the interfaces.

    The Front Desk, Race Control and Lap-line Tracker require access codes to function correctly.

    The server waits 500ms to respond if an incorrect access key is entered in the interface.

    The interface re-prompts the user to enter a correct access key when an incorrect access key is inserted.

Extra

    The system state is persisted.

When the server is restarted, the system resumes with the exact same. I.e. the race counter continues counting down, and upcoming races are not lost.

    The receptionist can assign drivers to specific cars.



Make MVP - minimum viable programm
Make using javascript, css, html, etc.
Frontend and backend.

Make possible run from terminal. 
Use node and npm.