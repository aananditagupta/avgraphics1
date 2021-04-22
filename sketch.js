
var samplePlayer = new maximJs.maxiSample();
var squareDim = 0;

var isVisual1 = false;
var isVisual2 = false;
var isVisual3 = false;
var isVisual4 = false;

var startSecs = 0;
var endSecs = 342; // 5mins 44 ... the length of the track
var dur = 342;

var audioContext;
var audioInit;

//envelope follower
var envFollower = new maximEx.envFollower();
var amp;

//visual-1
var gridDegrees = 0;

//visual -2
var noiseStep = 0.1;

//visual-3
var particles = [];
var envFollower2 = new maximEx.envFollower();
var amp2;
var upperThresh = 0.325;
var lowerThresh = 0.375;
var isFired = false;

//visual-4
var envFollower3 = new maximEx.envFollower();
var amp3;

function setup()
{
    createCanvas(windowWidth,windowHeight);

    squareDim = width * 0.1;
    noiseDim = min(width, height);

    //creating the MaximJs audio context
    audioContext = new maximJs.maxiAudio(); //We're using maximJs without an audio loop
    audioContext.play = playLoop;


}

function playLoop()
{
    
    if(samplePlayer.isReady())
    {
        //this use of play is pretty weird
        //I wouldn't worry about it now
        this.output = samplePlayer.play(1/dur, 44100 * startSecs, 44100 * endSecs);
        
        amp = envFollower.analyse(this.output, 0.005, 0.1);
        
        amp2 = envFollower2.analyse(this.output, 0.1, 1.0);
        
        amp3 = envFollower3.analyse(this.output, 0.05, 0.5);
    }
    else
    {
        this.output = 0;
    }
}

function draw()
{

    background(0);
    
    if(!audioInit)
    {
        push();
        fill(255);
        textSize(32);
        textAlign(CENTER);
        text("Press any key to start ...", width/2, height/2);
        pop();
        
        return;
        
    }
    
    
    fill(255);
    noStroke();

    text("visual1: " + isVisual1, 20,20);
    text("visual2: " + isVisual2, 20,40);
    text("visual3: " + isVisual3, 20,60);
    text("visual4: " + isVisual4, 20,80);

    text("startSecs: " + startSecs, 20, 100);
    text("Amp: " + amp, 20, 120);
    
    translate(width/2, height/2);
    rectMode(CENTER);

    if(isVisual1)
    {
        visual1();
    }

    if(isVisual2)
    {
        visual2();
    }

    if(isVisual3)
    {
        visual3();
        console.log(particles.length);
    }

    if(isVisual4)
    {
        visual4();
    }

}


function visual1()
{

  ////////////////////TEST GRAPHIC///////////////////////

  fill(amp * 500, 200 * amp3  , (amp + amp2) * 200);
//  rect(-squareDim, -squareDim, squareDim * amp, squareDim * amp);

    push();
//    translate(width/2, height/2);
    
    rotate(gridDegrees);
//    rect(0, 0, 20,20);
    for(var i = 0;i < 20;i++)
    {
        rect((-squareDim * i * 0.16) + (squareDim * 9.5 * 0.16), 0, squareDim * amp, squareDim * amp);
    }
    
    if(amp < 0.25)
    {
        gridDegrees += 0.01;
    }
    pop();
}

function visual2()
{

  ////////////////////TEST GRAPHIC///////////////////////

    stroke(0,255,0);
    noFill();
    //fill(125,125,125,125);
//    rect(squareDim, -squareDim, squareDim , squareDim );
    push();
    
    beginShape()
    
    for(var i = 0; i < 25; i++)
    {
        vertex(
            noise((i * noiseStep),amp) * noiseDim - noiseDim/2, 
            noise(((i - 500) * noiseStep), amp) * noiseDim - noiseDim/2);
    }
    
    if(amp > 0.375)
    {
        noiseSeed(frameCount);
    }
    
    endShape();
    pop();
}

function visual3()
{

  ////////////////////TEST GRAPHIC///////////////////////

    fill(0,0,255);
//  rect(squareDim, squareDim, squareDim , squareDim );
    
    if(amp2 < lowerThresh)
    {
        isFired = false;
    }
    
    for(var i = 0; i < particles.length; i++)
    {
        particles[i].run();
    }
    
    for(var j = particles.length - 1; j >= 0; j--)
    {
        if(particles[j].age < 0)
        {
            particles.splice(j, 1);
        }
    }
    
    if(amp2 > upperThresh)
    {
        for( var k = 0; k < 100; k++)
        {
            if(isFired == false)
            {
                particles.push(new Particle());
                isFired = true;
            }
        }
    }
}

function visual4()
{
  ////////////////////TEST GRAPHIC///////////////////////

//  rect(-squareDim, squareDim, squareDim , squareDim );
    noStroke();
    push();
    if(amp3 > 0.15 && amp3 > 0.35)
    {
        for(var i = 0; i < 10; i++)
        {
            fill(255 - i*10, 255 * amp3, i * 25);
            ellipse(random(-width/2,width/2), random(-height/2, height/2), 38 * amp3, 38 * amp3);
        }
    }
    pop();
}


function keyPressed()
{
    if(!audioInit)
    {
        audioInit = true;  
        audioContext.init();
        audioContext.loadSample("assets/aphex.mp3", samplePlayer);
        return;
    }
    
    if(key  == '1')
    {
        isVisual1 = !isVisual1; 
    }
    else if(key  == '2')
    {
        isVisual2 = !isVisual2; 
    }
    else if(key  == '3')
    {
        isVisual3 = !isVisual3; 
    }
    else if(key  == '4')
    {
        isVisual4 = !isVisual4; 
    }
    else if(key == ' ')
    {
        for( var i = 0; i < 100; i++)
        {
            particles.push(new Particle());
        }
    }

  
}

function mouseDragged(){

  //this allows you to scrub through the track
  startSecs = map(mouseX, 0 ,width, 0 , endSecs - 10);
  dur = endSecs - startSecs;
  samplePlayer.trigger();
}

//////////////////////////////////PARTICLE CONSTRUCTOR////////////////////////////////

function Particle() 
{
  this.velocity = createVector(random(-3.,3.), random(-3.,3.));
  this.loc = createVector(0,0);
  this.acceleration = createVector(0, 0);
  this.diam = 2;
  this.age = 1.0;

  this.run = function() {
    this.display();
    this.move();
    this.aging();
  }

  this.display = function() {
    noStroke();
    fill(255 * this.age);
    ellipse(this.loc.x, this.loc.y, this.diam, this.diam);
  }

  this.move = function() {
    this.loc.add(this.velocity);
  }

  this.aging = function(){
    this.age -= 0.003;
  }

}
