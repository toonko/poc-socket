import $, { map } from 'jquery'

export default {
  data () {
    return {
      webSocket: null,
      socketWsPath: 'wss://fah.conicle.com/ws/chat',
      inputMessage: null,
      accountId: this.$route.query.account,
      liveId: 12345,
      messages: [],
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
      // const link = 'wss://fah.conicle.com'
      const link = 'ws://localhost:3000'
      this.webSocket = new WebSocket(`${link}/ws/chat/${this.liveId}/`)

      this.webSocket.onopen = (event) => {
        alert(`[onopen] Connection ${this.liveId}`);
        console.log('[Socket: onopen]', event)
      }
      this.webSocket.onerror = (error) => console.log('[Socket: error]', error)
      this.webSocket.onmessage = (event) => { 
        const data = JSON.parse(event.data);
        console.log('[Socket: onmessage]', data)
        if (data.message && data.message.data) {
          this.loadMessage(data.message.data)
        } else if (!data.message.data) {
          this.addMessage(data.message)
        }
      }
      // this.webSocket.onclose = (event) => {
      //   if (event.wasClean) {
      //     console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
      //   } else {
      //     // e.g. server process killed or network down
      //     // event.code is usually 1006 in this case
      //     console.log('[close] Connection died');
      //   }
      // };
    },
    addMessage (text) {
      console.log('addMessage')
      // if (this.messages.findIndex((item) => item.text == text ) >= 0) return
      this.messages.push({
        name: `SenderA`, 
        text: text, 
        side: 'left'
      }) 
    },
    loadMessage (list) {
      console.log('loadMessage', list)
      const newList = [ ...this.messages ]
      map(list, message => {
        if (this.messages.findIndex((item) => item.text == message.body ) >= 0) return
        this.messages.push({
          id: message.id,
          account: message.account, 
          text: message.body, 
          side: (message.account != this.accountId) ? 'left' : 'right'
        }) 
      })
    },
    getCookie (name, src) {
      let cookieValue = null
      if (src !== '') {
        let cookies = src.split(';')
        for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim()
          // Does this cookie string begin with the name we want?
          if (cookie.substring(0, name.length + 1) === name + '=') {
            cookieValue = decodeURIComponent(cookie.substring(name.length + 1))
            break
          }
        }
      }
      return cookieValue
    },

    sendMessage (text) {
      this.messages.push({
        id : 1234,
        account: this.accountId, 
        text: text, 
        side: 'right'
      }) 
      this.webSocket.send(JSON.stringify({ message: text }))
      this.inputMessage = ''
    }
  }
}