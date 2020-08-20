import io from 'socket.io-client'
import $ from 'jquery'

export default {
  data () {
    return {
      connection: null,
      webSocket: null,
      webSocket2: null,
      socket: null,
      socketWsPath: 'wss://fah.conicle.com/ws/chat',
      socketWsPath2: 'wss://fah.conicle.com',
      socketHttpPath: 'https://fah.conicle.com/ws/chat',
      serverPath: 'https://fah.conicle.com/api/chat/message',
      inputMessage: null,
      accountId: null,
      liveId: 1,

      messages: [
        {name: 'Sender2', text: 'Dessert!!!!', side: 'left'},
        {name: 'Sender3', text: 'Carrot cake &#129409', side: 'left'},
        {name: 'Sender1', text: '&#9748; Jelly beans &#9748;', side: 'right'},
        {name: 'Sender1', text: 'apple pie', side: 'right'},
        {name: 'Sender3', text: 'I love cotton candy &#10084;', side: 'left'},
        {name: 'Sender1', text: 'Jelly-o jelly-o ', side: 'right'},
        {name: 'Sender3', text: 'pudding', side: 'left'},
        {name: 'Sender4', text: 'marshmallow', side: 'left'},
        {name: 'Sender3', text: 'Carrot cake', side: 'left'},
        {name: 'Sender1', text: 'Jelly beans', side: 'right'},
        {name: 'Sender3', text: 'I love cotton candy', side: 'left'},
        {name: 'Sender1', text: 'Jelly-o jelly-o ', side: 'right'},
        {name: 'Sender3', text: '&#127752;&#127752;&#127752;', side: 'left'},
        {name: 'Sender1', text: '&#9729; marshmallow &#9729;', side: 'right'},
        {name: 'Sender1', text: 'Jerry &#128057;', side: 'right'},
        {name: 'Sender2', text: 'Tom &#128008;', side: 'left'},
        {name: 'Sender1', text: 'Tom &#128008; & Jerry &#128057;', side: 'right'},
      ]
    }
  },
  mounted () {},
  watch: {
    messages (to) {
      $("#messageDisplay").animate({ scrollTop: $('#messageDisplay').prop("scrollHeight")}, 1000);
    }
  },
  methods: {
    connectSocket () {
      console.log("Starting connection to WebSocket Server")
      // this.webSocket2 = new WebSocket('wss://echo.websocket.org')
      this.webSocket2 = new WebSocket('wss://javascript.info/article/websocket/demo/hello')
      console.log('webSocket2', this.webSocket2)

      // this.connection = io(`${this.socketWsPath}/${this.liveId}/`)
      // this.connection = io(`${this.socketWsPath2}`, {transports: ['websocket'], path: `/ws/chat/${this.liveId}/`})
      // console.log('connection', this.connection.id, this.connection)
      // this.connection.open()

      this.webSocket = new WebSocket(`${this.socketWsPath}/${this.liveId}/`)
      console.log('webSocket', this.webSocket)

      // this.connection.on('connect', () => console.log('connect', this.connection))
      // this.connection.on('event', () => console.log('event', this.connection))
      // this.connection.on('error', (error) => console.log('error', this.connection, error))
      // this.connection.on('connect_error', (error) => console.log('connect_error', this.connection, error))
      // this.connection.on('connect_failed', (error) => console.log('connect_failed', this.connection, error))

      // this.connection.onmessage = function(event) {
      //   console.log('onmessage', event)
      // }

      this.webSocket.onopen = (event) => console.log('[webSocket: onopen]', event)
      this.webSocket2.onopen = (event) => console.log('[webSocket2: onopen]', event)

      this.webSocket.onerror = (error) => console.log('[webSocket: error]', error)
      this.webSocket2.onerror = (error) => console.log('[webSocket2: error]', error)
    
      // this.socket = io(`${this.socketPath}${this.liveId}`)
      // console.log('socket', this.socket)

      // this.connection.onclose = function(event) {
      //   if (event.wasClean) {
      //     alert(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      //   } else {
      //     // e.g. server process killed or network down
      //     // event.code is usually 1006 in this case
      //     alert('[close] Connection died');
      //   }
      // };

    },

    getRandomNum (min = 0, max) {
      return Math.floor(Math.random() * Math.floor(max)) + min
    },
    addMessage () {
      console.log('addMessage')
      this.messages.push({
        name: `Sender${this.getRandomNum(2, 3)}`, 
        text: this.messages[this.getRandomNum(0, this.messages.length - 2)].text, 
        side: 'left'
      }) 
    },
    loadMessage () {
      console.log('loadMessage')
      for (let index = 0; index < this.getRandomNum(4, 20); index++) {
        this.addMessage()
      }
    },
    sendMessage (text) {
      console.log('sendMessage')
      if (!text) return
      this.messages.push({
        name: 'Sender1', 
        text: text, 
        side: 'right'
      })

      this.inputMessage = ''
    }
  }
}