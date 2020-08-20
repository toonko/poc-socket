<template lang="pug">
  .p-5
    #buttons 
      button#cameraBtn.mr-2(@click='openUserMedia') Open camera & microphone
      button#screenBtn.mr-2(@click='openUserMediaScreen') Share screen
      button#createBtn.mr-2(@click='createRoom' disabled) Create room
      button#hangupBtn.mr-2(@click='hangUp' disabled) Hangup

    .detail.my-4
      .detail__title#currentRoom Current Room 
      .detail__room.w-50
        .d-flex
          input.form-control(v-model='roomIdInput' placeholder='room id')
          button#confirmJoinBtn.mx-2(@click='joinRoom') Join
        .d-flex.align-top.mt-2
          input.form-control(v-model='liveId' placeholder='live id')
          .mx-2
            input.form-control(v-model='accountId' placeholder='account id')
            div.small (acc id: [9, 10])
          button#connectSocketBtn(@click='connectSocket') Connect Socket
          


    .d-flex.live 
      .live__video.flex-fill
        video#remoteVideo.w-100(playsinline autoplay controls) 
        video#localVideo.live__video-local(muted playsinline autoplay style="width:250px;") 

        button(@click="addMessage") add Message
        button(@click="loadMessage") load Message

      .live__message.align-self-stretch.ml-3(style='min-width: 400px;')
        .d-flex.flex-column.h-100
          #messageDisplay.live__message-display.flex-fill.p-3
            .box(v-for="msg, index in messages" :key="index" :class="(msg.side == 'left') ? 'left' : 'right'")
              span(v-if="(messages[index - 1] && messages[index - 1].name !== msg.name) || index == 0") {{msg.name}}
              .bubble(v-html="msg.text")

          .d-flex.live__message-input.p-3
            input.form-control(v-model='inputMessage' placeholder="type message")
            button.ml-1(@click="sendMessage(inputMessage)") send

</template>

<script>
import liveHelper from '~/mixins/liveWebRTC.js'
import chatHelper from '~/mixins/RealTimeMessaging.js'
export default {
  mixins: [ liveHelper, chatHelper ],
  data () {
    return {
    }
  }
}
</script>

<style lang="scss">
.live {
  &__video {
    position: relative;
    &-local {
      position: absolute;
      bottom: 20px;
      right: 20px;
      max-width: 25%;
    }
  }

  &__message {
    background-color: lightgrey;
    max-height: 500px;
    &-display {
      overflow-y: scroll;
      .box {
        width: max-content;
        margin: 5px 0;
      }
      .bubble { 
        padding: 5px;
        border-radius: 5px;
        font-weight: bold;
      }
      .left {
        text-align: left;
        width: max-content;
        .bubble { background-color: white; }
      }
      .right {
        width: max-content;
        text-align: right;
        margin-left: auto;
        .bubble { background-color: #e53935; color: white; }
      }
    }
  }
}
</style>