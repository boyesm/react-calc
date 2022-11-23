import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

class Button extends React.Component {
  render() {
    return (
      <button
        className={this.props.className}
        onClick={() => this.props.onClick()}
      >
        {this.props.value}
      </button>
    );
  }
}

class Display extends React.Component {
  render() {
    return <input type="text" value={this.props.value}></input>;
  }
}

// class ButtonArray extends React.Component {}

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTextStr: "0", // this is what's currently being displayed. it is a string.
      history: [
        {
          inputVal1: undefined,
          inputVal2: undefined,
          finalVal: undefined,
          appliedOp: undefined,
        },
        // {
        //   inputVal1, // this is a Number. this is the first value in any of the operations applied
        //   appliedOp, // this is the operation applied
        //   inputVal2, // this is a Number. this is the second value in any of the operations applied
        //   finalVal, // this is a Number. this is the result of the operation on the two numbers
        // },
      ],
      clearAll: true, // what does this do
      displayingResult: false, // toggled after an operation so that additionally inputted digits won't be submitted
    };
  }

  // if C was just pressed: "AC"
  // if nothing has been inputted: "AC"
  // if anything has been inputted and "C" hasn't already been pressed: "C". remove latest operation or number input
  clearMemory() {
    const history = this.state.history.slice();
    if (this.state.clearAll) {
      // if AC is on
      // set inputVal1, inputVal2, appliedOp of most recent history obj to undefined
      history[history.length - 1].inputVal1 = undefined;
      history[history.length - 1].inputVal2 = undefined;
      history[history.length - 1].appliedOp = undefined;
      this.setState({
        history: history,
      });
    } else {
      // if C is on
      // remove latest op or value
      if (history[history.length - 1].appliedOp != undefined) {
        console.log("this is running");
        history[history.length - 1].appliedOp = undefined;
        this.setState({
          clearAll: true,
          history: history,
        });
      } else if (this.state.currentTextStr != "0") {
        console.log("the other thing isn't running");
        this.setState({
          currentTextStr: "0",
          clearAll: true,
        });
      }
    }
  }

  applyOperation(op) {
    // append to history: take current displayed text, convert to float, save to current history frame as inputVal1. change appliedOp
    // clear current text
    const history = this.state.history.slice();
    history[history.length - 1].inputVal1 = parseFloat(
      this.state.currentTextStr
    );
    history[history.length - 1].appliedOp = op.toString();

    this.setState({
      history: history,
      displayingResult: true,
    });
  }

  equate() {
    // convert currenttextstr to float. apply the operation that is in the most recent frame of history
    // write into history the values of inputVal2 and finalVal`

    const history = this.state.history.slice(); // used this to get the most recent inputVal1 and operations
    const inputVal1 = history[history.length - 1].inputVal1;
    const inputVal2 = parseFloat(this.state.currentTextStr);
    const appliedOp = history[history.length - 1].appliedOp;

    let finalVal;

    switch (appliedOp) {
      case "+":
        finalVal = inputVal1 + inputVal2;
        break;
      case "-":
        finalVal = inputVal1 - inputVal2;
        break;
      case "/":
        finalVal = inputVal2 == 0 ? "Not a number" : inputVal1 / inputVal2;
        break;
      case "*":
        finalVal = inputVal1 * inputVal2;
        break;
      default: // no operator was selected. return so that a new object in history is not created
        return;
    }

    history[history.length - 1].inputVal2 = inputVal2;
    history[history.length - 1].finalVal = finalVal;

    this.setState({
      currentTextStr: finalVal,
      history: history.concat({
        inputVal1: undefined,
        inputVal2: undefined,
        finalVal: undefined,
        appliedOp: undefined,
      }),
      displayingResult: true,
    });

    // [i think this will happen automatically] if final val is something and inputval1 is nothing, set inputval1 to finalval. if digits are entered, then don't do this.
  }

  appendCurrentText(d) {
    // [done] if a number is inputted after a calculation, it should create a new
    // [done] if a decimal is entered, don't let another decimal be entererd
    // make sure this is in line with good react practices regarding mutables
    // also you shouldn't perform equations with state because it's calculated asyncronously

    // this will change clearall from "AC" to "C" whenever any text has been entered
    if (this.state.clearAll) {
      this.setState({
        clearAll: false,
      });
    }

    if (this.state.displayingResult) {
      this.setState({
        currentTextStr: d.toString(),
        displayingResult: false,
      });
      return;
    }

    const value = this.state.currentTextStr;

    // if there is already a decimal in the text, don't allow another one to be added
    if (d == "." && value.indexOf(".") != -1) return;

    // this if statement makes it so there isn't a leading 0 in the displayed text
    let newval = value == "0" ? d.toString() : value.toString() + d.toString();

    if (newval == ".") newval = "0.";

    this.setState({
      currentTextStr: newval,
    });
  }

  // incorp this function into apply op?
  changeSignOfText() {
    // if first char is "-", remove it. if not add it
    const currentTextString = this.state.currentTextStr;
    const out =
      currentTextString.charAt(0) == "-"
        ? currentTextString.substring(1)
        : "-".concat(currentTextString);
    this.setState({
      currentTextStr: out,
      displayingResult: true,
    });
  }

  // incorp this function into apply op?
  convertTextToPercent() {
    const currentTextString = this.state.currentTextStr;
    const out = (parseFloat(currentTextString) / 100).toString();
    this.setState({
      currentTextStr: out,
      displayingResult: true,
    });
  }

  renderButton(value, functionType, text = value) {
    let func;
    let className;
    switch (functionType) {
      case "digit":
        func = () => this.appendCurrentText(value);
        value === 0 ? (className = "w2") : (className = "w1"); // adjusts the width of the zero button
        break;
      case "op":
        func = () => this.applyOperation(value);
        const history = this.state.history.slice();
        history[history.length - 1].appliedOp == value // this code makes sure the active operation button is a darker colour
          ? (className = "op-active")
          : (className = "op");
        break;
      case "eq":
        func = () => this.equate(value);
        className = "op";
        break;
      case "clear":
        func = () => this.clearMemory();
        this.state.clearAll ? (text = "AC") : (text = "C");
        break;
      case "sign":
        func = () => this.changeSignOfText();
        break;
      case "percent":
        func = () => this.convertTextToPercent();
        break;
    }
    return <Button value={text} onClick={func} className={className} />;
  }

  render() {
    return (
      <div className="calc-container">
        <Display value={this.state.currentTextStr} />
        {/* refactor the numbers into a number panel?? */}
        {this.renderButton("AC", "clear")}
        {this.renderButton("+/-", "sign")}
        {this.renderButton("%", "percent")}
        {this.renderButton("/", "op", "÷")}
        {this.renderButton(1, "digit")}
        {this.renderButton(2, "digit")}
        {this.renderButton(3, "digit")}
        {this.renderButton("*", "op", "x")}
        {this.renderButton(4, "digit")}
        {this.renderButton(5, "digit")}
        {this.renderButton(6, "digit")}
        {this.renderButton("+", "op")}
        {this.renderButton(7, "digit")}
        {this.renderButton(8, "digit")}
        {this.renderButton(9, "digit")}
        {this.renderButton("-", "op")}
        {this.renderButton(0, "digit")}
        {this.renderButton(".", "digit")}
        {this.renderButton("=", "eq")}
      </div>
    );
  }
}

class App extends React.Component {
  render() {
    return <Calculator />;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
