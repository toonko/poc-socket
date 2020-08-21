import $, { map } from 'jquery'

export default {
  data () {
    return {
      webSocket: null,
      socketWsPath: 'wss://fah.conicle.com/ws/chat',
      inputMessage: null,
      accountId: this.$route.query.account,
      liveId: 1,

      messages: [],
      messagesBackup: [
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
      const csrfToken = this.getCookie('csrftoken', document.cookie)
      console.log('Starting connection to WebSocket Server', csrfToken)

      this.webSocket = new WebSocket(`wss://fah.conicle.com/ws/chat/${this.liveId}/`)
      this.webSocket.onopen = (event) => console.log('[Fah\'s Socket: onopen]', event)
      this.webSocket.onerror = (error) => console.log('[Fah\'s Socket: error]', error)
      this.webSocket.onmessage = (event) => { console.log('onmessage', event) }

      // this.webSocket.onclose = function(event) {
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
      this.$axios({
        method: 'get',
        url: `/api/chat/message/?target=${this.liveId}`,
        headers: {'X-CSRFTOKEN': this.getCookie('csrftoken', document.cookie)}
      }).then(res => {
        console.log('res', res.data.results)
        const newList = [ ...this.messages ]
        map(res.data.results, message => {
          if (this.messages.findIndex((item) => item.id == message.id ) >= 0) return
          this.messages.push({
            id: message.id,
            account: message.account, 
            text: message.body, 
            side: (message.account != this.accountId) ? 'left' : 'right'
          }) 
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
      if (!text) return
      this.$axios({
        method: 'post',
        url: `/api/chat/message/?target=${this.liveId}`,
        data: { account: this.accountId || this.$route.query.account, live_id: this.liveId, body: text },
        headers: {'X-CSRFTOKEN': this.getCookie('csrftoken', document.cookie)}
      }).then(res => {
        console.log('res', res.data)
        this.messages.push({
          id : res.data.id,
          account: res.data.account, 
          text: text, 
          side: 'right'
        }) 
      })
      this.inputMessage = ''
    }
  }
}