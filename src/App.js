
import { Howl } from 'howler';
import './App.css';
// import * as mobilenet from '@tensorflow-models/mobilenet'
import *  as knnClassiflier from '@tensorflow-models/knn-classifier'
import soundURL from './assets/hey_sondn.mp3'
import * as tf from '@tensorflow/tfjs'
import React, { useState, useEffect , useRef} from 'react';
import '@tensorflow/tfjs-backend-webgl';
import { transpose } from '@tensorflow/tfjs-core';
import {iniNotifications,initNotifications,notify} from '@mycv/f8-notification'

var sound = new Howl({
  src:[soundURL]
})
// sound.play();  

const  NOT_TOUCH_LABEL = 'not_touch'
const  TOUCH_LABEL = 'touched'
const TRAIN_TIME=50
const TOUCH_CONFIDENCE = 0.8;


function App() {

  const video = useRef();
  const classifier = useRef();
  const canPlaySound = useRef(true)
  const mobilenetModule = useRef();
  const [touched,setTouched] = useState(false)



  const init   = async () =>{
    console.log("init...")
    await setupCamera();
    console.log('set up camera success')
    const mobilenet = require('@tensorflow-models/mobilenet');



     classifier.current = knnClassiflier.create();
     mobilenetModule.current = await mobilenet.load();

    console.log('setup done')
    console.log(" Khong cham tauy len mat va bam Train 1")

    initNotifications({cooldown:3000});

  }

  const setupCamera = ()  =>{
    return new Promise((resolve,reject) =>{
      navigator.getUserMedia = navigator.getUserMedia

      if(navigator.getUserMedia) {
        navigator.getUserMedia({video:true},
          
            stream =>{
                video.current.srcObject = stream;
                video.current.addEventListener('loadeddata',resolve )
            },
            error => reject()
          )
      } else{
        reject()
      }
    });
  }
  
  const train = async label =>{
    console.log(`[${label}] Dang train `)
      for(let i=0; i<TRAIN_TIME; i++){
        console.log(`Progress ${parseInt((i+1) / TRAIN_TIME * 100)} %`);
        
        await  training(label);
      }
  }


  /**
   * B1: Train cho may khuon mat khong cham tay
   * B2: Train cho may khuon mat co cham tay
   * B3: lay hinh anh hien tai,phan tich va so sanh voi data da hoc truoc
   * ==> neu ma matching voi data khuon mat cham tay ===> canh bao
   * @param {*} label 
   */
const training = label => {
    return new Promise(async resolve => {
      const embedding = mobilenetModule.current.infer(
        video.current,
        true
      );
      classifier.current.addExample(embedding, label);
      await sleep(100);
      resolve();
    });
  }

const run = async () =>{
  const embedding = mobilenetModule.current.infer(
    video.current,
    true
  );
  const result = await classifier.current.predictClass(embedding);

  console.log('Label:' , result.label);
  console.log('Confidences: ',result.confidences)

  if(result.label === TOUCH_LABEL && result.confidences[result.label] > TOUCH_CONFIDENCE){
      console.log('Touch')

      if(canPlaySound.current){
        canPlaySound.current=false
        sound.play(); 
      }
      
      notify("Bỏ tay ra !",{body:'ban vua cham tay vao mat'})
      setTouched(true)
  }
  else{
    console.log('not touch')
    setTouched(false)
  }

  await sleep(200)
  run();
}

const sleep = (ms = 0) =>{  
  return new Promise(resolve => setTimeout(resolve,ms))
}

  useEffect(() => {
      init()

      sound.on('end',function(){
        canPlaySound.current = false;
      })
    return () => {
      
    }
  }, [])
  return (
    <div className={`main ${touched ? 'touched' : ''}`}>
        <video
        className='video'
        ref={video}
        autoPlay
        ></video>
        <div className="control">
            <button className='btn' onClick={() => train(NOT_TOUCH_LABEL)}>Train 1</button>
            <button className='btn' onClick={() => train(TOUCH_LABEL )}>Traning2</button>
            <button className='btn' onClick={() => run()}>run</button>


        </div>
    </div>
  );
}

export default App;
