import firebase from 'firebase'
export default {
  head: {
    script: [
      { src: 'https://www.gstatic.com/firebasejs/7.17.2/firebase-app.js' }
    ]
  },
  data () {
    return {
      peerConnection: null,
      localStream: null,
      remoteStream: null,
      roomDialog: null,
      roomId: null,
      roomIdInput: '',
      vdoRec: null,
      configuration: {
        iceServers: [{ urls: [ 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }],
        iceCandidatePoolSize: 10
      }
    }
  },
  mounted () {
    this.init()
  },
  methods: {
    init () {
      firebase.initializeApp({
        apiKey: 'AIzaSyCrIL7bShMOpdZklQ3C34fMl-vQl345hxc',
        authDomain: 'testlive-943d2.firebaseapp.com',
        databaseURL: 'https://testlive-943d2.firebaseio.com',
        projectId: 'testlive-943d2',
        storageBucket: 'testlive-943d2.appspot.com',
        messagingSenderId: '885204091733',
        appId: '1:885204091733:web:790596109986470e4ba5dc',
        measurementId: 'G-SWF3FVXL61'
      })
    },
     async openUserMediaScreen (e) {
      console.log('openUserMedia', navigator)
      let stream 
      if (navigator.getDisplayMedia) {
        stream = await navigator.getDisplayMedia({video: true})
      } else if (navigator.mediaDevices.getDisplayMedia) {
        stream = await navigator.mediaDevices.getDisplayMedia({video: true})
      } else {
        stream = await navigator.mediaDevices.getUserMedia({video: {mediaSource: 'screen'}})
      }
      console.log('stream', stream)

      document.querySelector('#localVideo').srcObject = stream
      this.localStream = stream

      console.log('Stream:', document.querySelector('#localVideo').srcObject)
      document.querySelector('#screenBtn').disabled = true
      document.querySelector('#cameraBtn').disabled = true
      document.querySelector('#createBtn').disabled = false
      document.querySelector('#hangupBtn').disabled = false

      if (this.peerConnection) this.getTrackLocal()
    },
    async openUserMedia (e) {
      console.log('openUserMedia', navigator)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
        console.log('stream', stream)

        document.querySelector('#localVideo').srcObject = stream
        this.localStream = stream

        console.log('Stream:', document.querySelector('#localVideo').srcObject)
        document.querySelector('#screenBtn').disabled = true
        document.querySelector('#cameraBtn').disabled = true
        document.querySelector('#createBtn').disabled = false
        document.querySelector('#hangupBtn').disabled = false

        if (this.peerConnection) this.getTrackLocal()
      } catch (error) {
        console.log('error', error)
      }
    },
    startRecord () {
      console.log('start record')
       const recordBtn = document.getElementById('record')
       const webcam = document.querySelector('#localVideo')
       this.vdoRec = new MediaRecorder(webcam.srcObject)
       const chunks = []
        
      recordBtn.textContent = 'Recording'
      this.vdoRec.ondataavailable = e => chunks.push(e.data)
      this.vdoRec.onstop = async () => {
        console.log('onstop')
        this.transcode(new Uint8Array(await (new Blob(chunks)).arrayBuffer()))
        this.transcodeHLS(new Uint8Array(await (new Blob(chunks)).arrayBuffer()))
      }
      this.vdoRec.start()
    },
    stopRecord () {
      console.log('stop record')
      this.vdoRec.stop()
    },
    async transcode (webcamData) {
      // console.log('transcode')
      // const message = document.getElementById('message')
      // const name = 'record.webm'
      // message.innerHTML = 'Loading ffmpeg-core.js'
      // await ffmpeg.load()
      // message.innerHTML = 'Start transcoding'
      // await ffmpeg.write(name, webcamData)
      // await ffmpeg.transcode(name,  'output.mp4')
      // message.innerHTML = 'Complete transcoding'
      // const data = ffmpeg.read('output.mp4')

      // const video = document.getElementById('outputVideo')
      // video.src = URL.createObjectURL(new Blob([data.buffer], { type: 'video/mp4' }))
    },
    async transcodeHLS (webcamData) {
      console.log('transcodeHLS')
    },
    async createRoom () {
      document.querySelector('#createBtn').disabled = true
      const db = firebase.firestore()
      const roomRef = await db.collection('rooms').doc()

      this.peerConnection = new RTCPeerConnection(this.configuration)
      this.registerPeerConnectionListeners()
      // console.log('Create PeerConnection with configuration: ', this.peerConnection)

      // this.localStream.getTracks().forEach(track => {
      //   console.log('broadcast side track', track)
      //   this.peerConnection.addTrack(track, this.localStream)
      // })
      this.getTrackLocal()

      const callerCandidatesCollection = roomRef.collection('callerCandidates')
      this.peerConnection.addEventListener('icecandidate', event => {
        if (!event.candidate) {
          // console.log('Got final candidate!')
          return
        }
        // console.log('Got candidate: ', event.candidate)
        callerCandidatesCollection.add(event.candidate.toJSON())
      })

      const offer = await this.peerConnection.createOffer()
      await this.peerConnection.setLocalDescription(offer)
      // console.log('Created offer:', offer)

      const roomWithOffer = {
        'offer': {
          type: offer.type,
          sdp: offer.sdp,
        },
      }
      await roomRef.set(roomWithOffer)
      this.roomId = roomRef.id
      // console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`)
      document.querySelector('#currentRoom').innerText = `Current room is ${roomRef.id} - You are the caller!`

      this.remoteStream = new MediaStream()
      document.querySelector('#remoteVideo').srcObject = this.remoteStream

      this.peerConnection.addEventListener('track', event => {
        console.log('local got remote track', event.streams[0])
        event.streams[0].getTracks().forEach(track => {
          this.remoteStream.addTrack(track)
          console.log('Add a track to the remoteStream:', track)
        })
      })

      // Listening for remote session description below
      roomRef.onSnapshot(async snapshot => {
        const data = snapshot.data()
        if (!this.peerConnection.currentRemoteDescription && data && data.answer) {
          // console.log('Got remote description: ', data.answer)
          const rtcSessionDescription = new RTCSessionDescription(data.answer)
          await this.peerConnection.setRemoteDescription(rtcSessionDescription)
        }
      })

      // Listen for remote ICE candidates below
      roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
        snapshot.docChanges().forEach(async change => {
          if (change.type === 'added') {
            let data = change.doc.data()
            // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
            await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
          }
        })
      })
    },
    async joinRoom () {
      document.querySelector('#createBtn').disabled = true
      console.log('Join room: ', this.roomIdInput)
      this.roomId = this.roomIdInput
      document.querySelector('#currentRoom').innerText = `Current room is ${this.roomIdInput} - You are the callee!`
      await this.joinRoomById(this.roomIdInput)
    },
    getTrackLocal () {
      if (this.localStream && this.peerConnection) {
        console.log('localstream')
        this.localStream.getTracks().forEach(track => {
          this.peerConnection.addTrack(track, this.localStream)
        })
      }
    },
    async joinRoomById (roomId) {
      console.log('joinRoomById', roomId)
      const db = firebase.firestore()
      const roomRef = db.collection('rooms').doc(`${roomId}`)
      const roomSnapshot = await roomRef.get()
      console.log('Got room:', roomSnapshot.exists)

      if (roomSnapshot.exists) {
        // console.log('roomSnapshot exists', this.peerConnection)
        this.peerConnection = new RTCPeerConnection(this.configuration)
        // console.log('Create PeerConnection with configuration: ', this.peerConnection)
        this.registerPeerConnectionListeners()

        this.getTrackLocal()
        
        const calleeCandidatesCollection = roomRef.collection('calleeCandidates')
        this.peerConnection.addEventListener('icecandidate', event => {
          if (!event.candidate) {
            // console.log('Got final candidate!')
            return
          }
          // console.log('Got candidate: ', event.candidate)
          calleeCandidatesCollection.add(event.candidate.toJSON())
        })

        this.remoteStream = new MediaStream()
        document.querySelector('#remoteVideo').srcObject = this.remoteStream

        this.peerConnection.addEventListener('track', event => {
          console.log('addEventListener track', event)
          event.streams[0].getTracks().forEach(track => {
            this.remoteStream.addTrack(track)
            console.log('Add a track to the remoteStream:', track)
          })
        })

        // Code for creating SDP answer below
        const offer = roomSnapshot.data().offer
        // console.log('Got offer:', offer)
        await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer))
        const answer = await this.peerConnection.createAnswer()
        // console.log('Created answer:', answer)
        await this.peerConnection.setLocalDescription(answer)

        const roomWithAnswer = {
          answer: {
            type: answer.type,
            sdp: answer.sdp,
          },
        }
        await roomRef.update(roomWithAnswer)

        // Listening for remote ICE candidates below
        roomRef.collection('callerCandidates').onSnapshot(snapshot => {
          snapshot.docChanges().forEach(async change => {
            if (change.type === 'added') {
              let data = change.doc.data()
              // console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`)
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(data))
            }
          })
        })
      }
    },
    async hangUp (e) {
      const tracks = document.querySelector('#localVideo').srcObject.getTracks()
      tracks.forEach(track => {
        track.stop()
      })

      if (this.remoteStream) { this.remoteStream.getTracks().forEach(track => track.stop()) }
      if (this.peerConnection) { this.peerConnection.close() }

      document.querySelector('#localVideo').srcObject = null
      document.querySelector('#remoteVideo').srcObject = null
      document.querySelector('#screenBtn').disabled = false
      document.querySelector('#cameraBtn').disabled = false
      document.querySelector('#createBtn').disabled = true
      document.querySelector('#hangupBtn').disabled = true
      document.querySelector('#currentRoom').innerText = ''

      // Delete room on hangup
      if (this.roomId) {
        const db = firebase.firestore()
        const roomRef = db.collection('rooms').doc(this.roomId)
        const calleeCandidates = await roomRef.collection('calleeCandidates').get()
        console.log('calleeCandidates', calleeCandidates)
        calleeCandidates.forEach(async candidate => {
          await candidate.ref.delete()
        })
        const callerCandidates = await roomRef.collection('callerCandidates').get()
        console.log('callerCandidates', callerCandidates)
        callerCandidates.forEach(async candidate => {
          await candidate.ref.delete()
        })
        await roomRef.delete()
      }
      // document.location.reload(true)
    },
    registerPeerConnectionListeners () {
      this.peerConnection.addEventListener('icegatheringstatechange', () => { /*console.log(`ICE gathering state changed: ${this.peerConnection.iceGatheringState}`)*/ })
      this.peerConnection.addEventListener('connectionstatechange', () => { console.log(`Connection state change: ${this.peerConnection.connectionState}`) })
      this.peerConnection.addEventListener('signalingstatechange', () => { /*console.log(`Signaling state change: ${this.peerConnection.signalingState}`)*/ })
      this.peerConnection.addEventListener('iceconnectionstatechange ', () => { /*console.log(`ICE connection state change: ${this.peerConnection.iceConnectionState}`)*/ })
    }
  }
}
