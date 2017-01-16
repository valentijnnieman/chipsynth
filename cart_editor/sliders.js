class Slider extends React.Component {
  constructor(props) {
    super();
    this.state = {
      value: props.value
    };
    this.handleSliding = this.handleSliding.bind(this);
  }

  handleSliding(e) {
    this.setState({ value: e.target.value });
    console.log(this.state.value);

    var allSounds = Chip.GetSounds();
    allSounds[Chip.FindSound(this.props.soundName)].oscillators[this.props.oscillatorIndex].alter(this.props.name, this.state.value);
  }

  render() {
    return(
      <div className='outerBox'>
        <span>{this.props.name}</span>
        <input className='numberBox' type="number" value={this.state.value}/>
        <input className='slider' type="range" min="0" max={this.props.maxValue} value={this.state.value} onChange={this.handleSliding} step={this.props.stepSize}/>
      </div>
    );
  };
}

class Oscillator extends React.Component {
  constructor() {
    super();

  }
  render() {
    console.log(this.props.oscillator);
    return(
      <div className='sliders'>
        <p></p>
        <Slider name='start' value={this.props.oscillator.start} soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1000' stepSize='1'/>
        <Slider name='end' value={this.props.oscillator.end} soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1000' stepSize='1'/>
        <Slider name='a' value={this.props.oscillator.a} soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1.0' stepSize='0.01'/>
        <Slider name='d' value={this.props.oscillator.d} soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1.0' stepSize='0.01'/>
        <Slider name='s' value= {this.props.oscillator.s} soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1.0'  stepSize='0.01'/>
        <Slider name='r' value={this.props.oscillator.r}  soundName={this.props.soundName} oscillatorIndex={this.props.oscillatorIndex} maxValue='1.0' stepSize='0.01'/>
      </div>
    )
  }
}

class Sound extends React.Component {
  constructor(props) {
   super();
   this.sound = Chip.GetSound(props.name);
   this.handlePlay = this.handlePlay.bind(this);
  }

  handlePlay(name) {
    console.log("Playing " + name);
    Chip.Play(name)
  }

  render() {
    var that = this;
    var allOscillators = this.sound.oscillators.map(function(oscillator, index) {
      return (
      <div className='oscillator'>
        <p>Oscillator {index + 1}</p>
        <Oscillator oscillatorIndex={index} oscillator={oscillator} soundName={that.props.name}/>
      </div>
    );
  });
    return(
      <div className='soundBox'>
        <button onClick={() => this.handlePlay(this.props.name)}>{this.props.name}</button>
        <div className='oscillators'>
          {allOscillators}
        </div>
      </div>
    );
  }
}

function Editor() {
  return(
    <div className='editor'>
      <Sound name='jump' />
      <Sound name='shoot' />
      <Sound name='explode' />
      <Sound name='coin' />
    </div>
  );
}

ReactDOM.render(
  <Editor />,
  document.getElementById('editor')
);
