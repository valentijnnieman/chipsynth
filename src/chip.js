// Chip class for CHIPSYNTH
//
// by Valentijn Nieman

var Chip = ( function()
{
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    var _context = new AudioContext();
    var _path = "/presets/"; // where cartridges are located
    var _sounds = [];   // holds all Sounds loaded from cartridge
    var Chip = {};    // holds all public functions/objects

    Chip.GetContext = function()
    {
        return _context;
    }

    Chip.GetSounds = function()
    {
      return _sounds;
    }

    Chip.GetSound = function(sound) 
    {
        // find sound in array based on string or number
        if(typeof sound === "string")
        {
            return _sounds[Chip.FindSound(sound)];
        }
        else
        {
            return _sounds[sound];
        }
    }

    Chip.Load = function(cartridgeName)
    {   
        _sounds = [];   // clear current loaded sounds & load from cartridge
        var cartridge = {};
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = function()
        {
            if(xhr.readyState === XMLHttpRequest.DONE)
            {
                if(xhr.status === 200)
                {
                    cartridge = JSON.parse(xhr.responseText);
                    for (i in cartridge)
                    {
                        var newSound = new Chip.Sound(cartridge[i], i);    
                        _sounds.push(newSound);
                    } 

                }
                else
                {
                    if(error) alert("xmlhttprequest failed!");
                }
            }
        };
        xhr.open("GET", _path + cartridgeName + ".json", true);
        xhr.send();
    };

    Chip.FindSound = function(name)
    {
        var number;
        for(var i = 0; i < _sounds.length; i++)
        {
            if(name === _sounds[i].name)
            {
                number = i;
                break;
            }
        }

        return number;
    }

    Chip.AlterSound = function(sound, freq)
    {
        // find sound in array based on string or number
        if(typeof sound === "string")
        {
            _sounds[Chip.FindSound(sound)].oscillators[0].start = freq;
        }
        else
        {
            _sounds[sound].trigger();
        }
    }

    Chip.Play = function(sound)
    {
        // find sound in array based on string or number
        if(typeof sound === "string")
        {
            _sounds[Chip.FindSound(sound)].trigger();
        }
        else
        {
            _sounds[sound].trigger();
        }
    }
    return Chip;
} ) ();

Chip.Oscillator = function(sound)
{
    this.start = sound.start;
    this.end = sound['gliss-end'];
    this.type = sound.type;
    this.a = sound.a;
    this.d = sound.d;
    this.s = sound.s;
    this.s = Math.max(0, Math.min(this.s, 1));  // clamp 0-1 to prevent clipping
    this.r = sound.r;
    if(sound.arp)
    {
        this.arp = sound.arp;
    }
    this.arpEnd = sound['arp-end'];

    this.gain = Chip.GetContext().createGain();
    this.gain.connect(Chip.GetContext().destination);

    this.osc = Chip.GetContext().createOscillator();
    // because web audio api does not support a white noise 
    // oscillator, we have to create our own using a normal audio
    // buffer:
    if(this.type === 'noise')
    {
        this.osc = this.createNoiseGen();
    }
    else
    {
        this.osc.type = this.type;
    }
    
    this.osc.start(0);
};

Chip.Oscillator.prototype.alter = function(parameter, value) 
{
  switch(parameter) {
    case 'start':
      this.start = value;
      break;
    case 'end':
      this.end = value;
      break;
    case 'a':
      this.a = Number(value);
      break;
    case 'd':
      this.d = Number(value);
      break;
    case 's':
      this.s = Number(value);
      break;
    case 'r':
      this.d = Number(value);;
      break;
  }
}

Chip.Oscillator.prototype.trigger = function(maxGain, step)
{
    var now = Chip.GetContext().currentTime + step * 0.1;
    this.osc.connect(this.gain);
    // set adsr values
    this.gain.gain.cancelScheduledValues(now);
    this.gain.gain.setValueAtTime(0, now);
    console.log(typeof(this.a));
    console.log("this.a: " + this.a);
    this.gain.gain.linearRampToValueAtTime(maxGain, now + this.a);
    this.gain.gain.linearRampToValueAtTime(this.s, now + this.a + this.d);
    this.gain.gain.linearRampToValueAtTime(0, now + this.a + this.d + this.r);
    // set freq for arp
    if(this.arpEnd)
    {
        // define the distances between arpeggiated notes
        var stepSize = ((this.arpEnd - this.start) / (this.arp-1)) * step;
        var freq = this.start + stepSize ;
    }
    // set the frequency values (i.e. glissando)
    if(this.type !== 'noise')   // noise generators don't need no glissando
    {
        this.osc.frequency.cancelScheduledValues(now);
        if(freq) this.osc.frequency.setValueAtTime(freq, now);
        else this.osc.frequency.setValueAtTime(this.start, now);
        if(freq) this.osc.frequency.linearRampToValueAtTime(freq, now + this.a + this.d + this.s + this.r);
        else this.osc.frequency.linearRampToValueAtTime(this.end, now + this.a + this.d + this.s + this.r);
    }
    if(step < this.arp-1) this.trigger(maxGain, step+1);  // repeat for arpeggios
};

Chip.Oscillator.prototype.createNoiseGen = function()
{
    // create a basic white noise generator using a 
    // normal audio buffer
    var bufferSize = 4096 * 2;
    var b0, b1, b2, b3, b4, b5, b6;
    b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
    
    // generate pink noise
    var node = Chip.GetContext().createBufferSource();
    var buffer = Chip.GetContext().createBuffer(1, bufferSize, Chip.GetContext().sampleRate);
    var data = buffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++)
    {
        var white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        data[i] *= 0.3;
        b6 = white * 0.115926;
    }
    node.buffer = buffer;
    node.loop = true;

    return node;
};


Chip.Sound = function(sound, name)
{
    this.name = name;
    this.oscillators = [];
    // unpack json object
    for(var i = 0; i < sound.length; i++)
    {
        var newOsc = new Chip.Oscillator(sound[i]);
        this.oscillators.push(newOsc);
    }
}

Chip.Sound.prototype.trigger = function()
{
    for(var i = 0; i < this.oscillators.length; i++)
    {
        var maxGain;
        if(this.oscillators.length === 1) maxGain = 0.5;
        else maxGain = 1.0/this.oscillators.length
        this.oscillators[i].trigger(maxGain, 0);
    }
}

Chip.Load('basic');
// Chip.Play('shoot');
