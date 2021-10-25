
import { Howl } from 'howler';
import './App.css';
import * as mobilenet from '@tensorflow-models/mobilenet'
import *  as knnClassiflier from '@tensorflow-models/knn-classifier'
import soundURL from './assets/hey_sondn.mp3'
import React, { useState, useEffect , useRef} from 'react';

var sound = new Howl({
  src:[soundURL]
})
sound.play();

const  NOT_TOUCH_LABEL = 'not_touch'
const  TOUCH_LABEL = 'touched'
const TRAIN_TIME=50


function App() {

  const video = useRef();
  const  classifier=  useRef();
  const mobilenetModel= useRef();

  const init = async() =>{
    console.log('init ...')
    await setupCamera();
    console.log("setup camera success")

    classifier.current = knnClassiflier.create();

    mobilenetModel.current = await mobilenet.load();
    console.log('setup done')
    console.log('Không chạm tay lên mặt vf bấm train 1')

  }

  const setupCamera = () =>{
      return new Promise((resolve,reject) =>{
        navigator.getUserMedia = navigator.getUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.msGetUserMedia ;

      if(navigator.getUserMedia){
        
        navigator.getUserMedia(
          {video:true},
          stream =>{
            video.current.srcObject = stream;
            video.current.addEventListener('loadeddata', resolve)
          }, 
          error => reject(error)
        )
        
      }
      else{
        reject();
      }
      })
  }


  const train = async label =>{
     for(let i = 0 ; i < TRAIN_TIME;  i++ ){
       console.log(`Progress ${parseInt((i+1) / TRAIN_TIME * 100)}%`)
        await sleep(100)
      }
  }
  const sleep = (ms = 0 ) => {
    return new Promise(resolve => setTimeout(resolve,ms))
  }

  useEffect(() => {
      init()
    return () => {
      
    }
  }, [])
  return (
    <div className="main">
        <video
        className='video'
        ref={video}
        ></video>
        <div className="control">
            <button className='btn' onClick={() => train(NOT_TOUCH_LABEL)}>Train 1</button>
            <button className='btn' onClick={() => train(TOUCH_LABEL)}>Traning2</button>
            <button className='btn' onClick={() => train()}>run</button>


        </div>
    </div>
  );
}

export default App;
