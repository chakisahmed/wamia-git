import React from "react";
import { Text, View } from "react-native";
import { COLORS,FONTS } from "../constants/theme";

interface StopWatchProps {
  seconds?: number;
}
interface StopWatchState {
  time: {
    d: number;
    h: number;
    m: number;
    s: number;
  };
  seconds: number;
}

export default class StopWatch extends React.Component<StopWatchProps, StopWatchState> {
  timer: NodeJS.Timeout | null;
    constructor(props: StopWatchProps) {
      super(props);
      const { seconds = 31000 } = props; 
      this.state = { time: {
        d: 0,
        h: 0,
        m: 0,
        s: 0
      }, seconds };
      this.timer = null;
      this.startTimer = this.startTimer.bind(this);
      this.countDown = this.countDown.bind(this);
    }
  
    secondsToTime(secs: any) {
      let days = Math.floor(secs / (24 * 60 * 60));
      let divisor_for_hours = secs % (24 * 60 * 60);
      let hours = Math.floor(divisor_for_hours / (60 * 60));
    
      let divisor_for_minutes = divisor_for_hours % (60 * 60);
      let minutes = Math.floor(divisor_for_minutes / 60);
    
      let divisor_for_seconds = divisor_for_minutes % 60;
      let seconds = Math.ceil(divisor_for_seconds);
    
      let obj = {
      "d": days,
      "h": hours,
      "m": minutes,
      "s": seconds
      };
      return obj;
    }
  
    componentDidMount() {

      this.startTimer();

      let timeLeftVar = this.secondsToTime(this.state.seconds);
      
      this.setState({ time: timeLeftVar });
    }
  
    startTimer() {
      if (this.timer === null && this.state.seconds > 0) {
        this.timer = setInterval(this.countDown, 1000);
      }
    }
  
    countDown() {
      // Remove one second, set state so a re-render happens.
      
      let seconds = this.state.seconds - 1;
      this.setState({
        time: this.secondsToTime(seconds),
        seconds: seconds,
      });
      
      // Check if we're at zero.
      if (seconds == 0) { 
        if (this.timer !== null) {
          clearInterval(this.timer);
        }
      }
    }
  
    render() {
      return(
        <View>
          <View style={{
            flexDirection:'row',
            alignItems:'center',
            gap:5
          }}>
            <View style={{flexDirection:'row',gap:2,backgroundColor:COLORS.secondary,borderRadius:4,paddingVertical:2,paddingHorizontal:5}}>
              <Text style={{...FONTS.fontMedium,fontSize:13,color:COLORS.title,}}>{this.state.time.h}</Text>
              <Text
                  style={{
                      ...FONTS.fontMedium,
                      fontSize:13,
                      color:COLORS.title,
                      //marginRight:10,
                      //top:3,
                  }}
                  >h</Text>
            </View>
            <View style={{flexDirection:'row',gap:2,backgroundColor:COLORS.secondary,borderRadius:4,paddingVertical:2,paddingHorizontal:5}}>
              <Text  style={{...FONTS.fontMedium,fontSize:13,color:COLORS.title,}}>{this.state.time.m}</Text>
              <Text
                  style={{
                      ...FONTS.fontMedium,
                      fontSize:13,
                      color:COLORS.title,
                      //marginRight:10,
                      //top:3,
                  }}
                  >m</Text>
            </View>
            <View style={{flexDirection:'row',gap:2,backgroundColor:COLORS.secondary,borderRadius:4,paddingVertical:2,paddingHorizontal:5}}>
              <Text  style={{...FONTS.fontMedium,fontSize:13,color:COLORS.title,}}>{this.state.time.s}</Text>
              <Text
                  style={{
                      ...FONTS.fontMedium,
                      fontSize:13,
                      color:COLORS.title,
                      //marginRight:10,
                      //top:3,
                  }}
              >s</Text>
            </View>
          </View>
        </View>
      );
    }
}