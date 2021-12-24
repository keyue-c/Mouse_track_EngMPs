PennController.ResetPrefix(null)

Sequence("instruction", randomize("experiment"), SendResults())

// Instruction
newTrial("instruction", 
    defaultText
        .cssContainer({"margin-top":"1em"})
        .cssContainer({"margin-bottom":"1em"})
        .cssContainer({"margin-left":"0em"})
        .print()
    ,
    newText("instruction1", "Listen to the sentences, and click on the object mentioned at the end of the sentences.")
    ,
    newText("instruction2", "Step 1: Click the botten \"Go\" to start a trial. A sentence recording will start to play, and a small red box will appear at the position where the button was.")
    ,
    newText("instruction3", "Step 2: Listen to the sentences. <b>Don't move your mouse</b>.")
    ,
    newText("instruction4", "Step 3: Move the mouse <b>after the red box disappears</b>, You will be warned if you move your mouse before the red box disappears.")
    ,
    newText("instruction5", "Step 4: Click on the correct object <b>as quickly as possible</b>. You will be warned if you take too long to click on one object.")
    ,
    newButton("continue", "Click here to start")
        .cssContainer({"margin-top":"1em"})
        .center()
        .print()
        .wait()
)

// Experiment
Template ("items.csv", row => 
  newTrial("experiment",
    fullscreen()
    ,
    // All the images will have the same size: 200px*200px
    defaultImage.size(200,200)
    ,
    newCanvas("images", 1100, 550)  // 550px height: we will print the button at the bottom
        .color("white")             // Use a white background
        .add(  0 , 100 , newImage("1", row.Position1) )
        .add(300 , 100 , newImage("2", row.Position2) )
        .add(600 , 100 , newImage("3", row.Position3) )
        .add(900 , 100 , newImage("4", row.Position4) )
        .print("center at 50vw","top at 2em")
    ,
    // These are the feedback tooltips, in case the mouse moves too early or click is too late
    newTooltip("earlyWarning", "STARTED TOO EARLY. </br>You moved your mouse from the red box before it disappeared. </br>Don't move your mouse until the red box disappears!</br>")
    ,
    newTooltip("slowClickWarning", "CLICKED TOO LATE. </br>You took too long to click on your selection. </br>Be faster next time! </br>")
    ,
    // Give 2s to preview the images
    newTimer(2000)
        .start()
        .wait()
    ,
    // This button is horizontally centered, at the bottom of the 1100px*550px surface:
    // that's where the cursor will be when we start tracking the mouse
    newButton("oneTrialStart", "Go")
        .print("center at 50%" , "bottom at 98%" , getCanvas("images"))
        .wait()
        .remove()
    ,
    newVar("isEarly", false)
    ,
    newVar("slowClick", false)
    ,
    // Launch timers to detect early movement and late clicks
    newTimer("earlyStart", (parseInt(row.MWon) - 800) ).start()
    ,
    newTimer("timeLimit", (parseInt(row.Noff) + 500)).start()
    ,
    // Start tracking mouse movements and clicks
    newMouseTracker("mouse")
        .log()
        // Check the earlyStart timer whenever the mouse moves:
        // set the "isEarly" Var element to true if the timer is still running
        .callback( getTimer("earlyStart").test.running().success(getVar("isEarly").set(true)) )
        .start()
    ,
    // Play the audio sentences
    newAudio("sentenceAudio", row.Audio)
        .play()
    ,
    getAudio("sentenceAudio").log("play")
    ,
    newImage("redBox", "redbox.png")
        .size(30,30)
        .print("center at 50%" , "bottom at 100%" , getCanvas("images"))
    ,
    newTimer("boxTimer", (parseInt(row.MWon) - 500))
        .start()
        .wait()
    ,
    getImage("redBox")
        .remove()
    ,
    // Make the images clickable
    newSelector("imageChoice")
        .add(getImage("1") , getImage("2") , getImage("3") , getImage("4"))
        .log()
        .wait()
    ,
    // If the "timeLimit" timer has ended by the time an image is clicked, set "slowClick" to true
    getTimer("timeLimit").test.ended().success(getVar("slowClick").set(true))
    ,
    // Make sure the sentences is done playing before proceeding
    getAudio("sentenceAudio").wait("first")
    ,
    // Stop the mouse tracker to avoid massive resuls files
    getMouseTracker("mouse").stop()
    ,
    // Show feedback if necessary
    getVar("isEarly").test.is(true).success(
        getTooltip("earlyWarning")
            .print( "center at 50%", "middle at 50%" , getCanvas("images"))
            .wait()
    )
    ,
    getVar("slowClick").test.is(true).success(
        getTooltip("slowClickWarning")
            .print( "center at 50%", "middle at 50%" , getCanvas("images"))
            .wait()
    )
  )
  // Log the participant's id, passed as a parameter in the URL (?id=...)
  .log( "id"                   , GetURLParameter("id"))
  // Log values from table and from Var elements
  .log( "item"                 , row.Item)
  .log( "predictability"       , row.Predictability)
  .log( "MW"                   , row.MW)
  .log( "target_position"      , row.Target_position)
  .log( "expected_position"    , row.Expected_position)
  .log( "unexpected_position"  , row.Unexpected_position)
  .log( "MWon"              , row.MWon)
  .log( "Noff"              , row.Noff)
)
