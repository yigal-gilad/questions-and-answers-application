import { LitElement, html, css } from "./node_modules/lit-element/lit-element.js";
import { repeat } from "./node_modules/lit-html/directives/repeat.js";

class ProjectCard extends LitElement {
  createRenderRoot() {
    return this;
  }

  render() {
    return html`
        <div class="container">
        <h3> <b> ${this.name} </b> </h3>
        <div class="input-group mb-3">
  <input type="text" id="myInput" value="${this.input}" @input=${e => {
      this.input = e.target.value;
    }} class="form-control" placeholder="Ask your question here...">
  <div class="input-group-append">
    <button id="mybutton" class="btn btn-dark" ?disabled="${!this.input}"
     @click="${e => {
      this.sendQuestion(this.input);
    }}">Ask</button>
  </div>
 
</div>
<div class="text-center" ?hidden="${this.messages.length}">
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<br>
<h3>Be the first to ask a question!</h3>
</div>
<ul class="list-group" ?hidden="${!this.messages.length}">
${repeat(this.messages, item => item.type, (item, index) => html`

<li ?hidden="${item.type !== "bot_answer"}" class="list-group-item" style="word-wrap: break-word;">
<span class="badge badge-warning" ?hidden="${index !== 0}">new!</span>
<h5>Answer to similer question:</h5>

<p>${item.payload.question}</p>
<h6>Bot answerd:</h6>
<p>${item.payload.answer}</p>
</li>
<li ?hidden="${item.type !== "user_answer"}" class="list-group-item" style="word-wrap: break-word;">
<span class="badge badge-warning" ?hidden="${index !== 0}">new!</span>
<h5>Answer to question:</h5>
<p>${item.payload.question}</p>
<h6>User answerd:</h6>
<p>${item.payload.answer}</p>
</li>
<li ?hidden="${item.type !== "user_question"}" class="list-group-item" style="word-wrap: break-word;">
<span class="badge badge-warning" ?hidden="${index !== 0}">new!</span>
<h5>User asked a question:</h5>
<p>${item.payload.question}</p>
<!-- Button to Open the Modal -->
<button type="button"
 class="btn btn-primary float-right" data-toggle="modal" data-target="#myModal" @click="${e => {
      this.selectedQuestion = item.payload.question;
    }}">
  Answer
</button>

</li>
`)}
</ul>
  <!-- The Modal -->
  <div class="modal" id="myModal">
    <div class="modal-dialog">
      <div class="modal-content">
      
        <!-- Modal Header -->
        <div class="modal-header">
          <h4 class="modal-title">Answer to question</h4>
          <button type="button" class="close" data-dismiss="modal">&times;</button>
        </div>
        
        <!-- Modal body -->
        <div class="modal-body">
        <p>${this.selectedQuestion}</p>
        <input type="text" id="answerInput" @input=${e => {
      this.answerInput = e.target.value;
    }} 
         class="form-control" placeholder="Answer this question here...">
        <br>
        <div data-dismiss="modal">
          <button type="button"
            class="btn btn-primary float-right"
            @click="${e => {
      this.sendAnswer(this.selectedQuestion, this.answerInput);
    }}"
            ?disabled="${!this.answerInput}"
          >Answer</button>
          </div>
        </div>    
      </div>
    </div>
  </div>
</div>
  <br> `;
  }

  constructor() {
    super();
    this.mainUrl = window.location.href;
    this.getMessagesUrl = this.mainUrl + "getmessages";
    this.sendQuestionUrl = this.mainUrl + "hendlequestion";
    this.sendAnswerUrl = this.mainUrl + "hendleanswer";
    this.input = "";
    this.answerInput = "";
    this.messages = [];
    setInterval(() => {
      this.getMessages();
    }, 2000);
  }

  static get properties() {
    return {
      name: {
        type: String
      },
      mainUrl: {
        type: String
      },
      getMessagesUrl: {
        type: String
      },
      sendQuestionUrl: {
        type: String
      },
      sendAnswerUrl: {
        type: String
      },
      input: {
        type: String
      },
      selectedQuestion: {
        type: String
      },
      answerInput: {
        type: String
      },
      messages: {
        type: Array
      }
    };
  }

  getMessages() {
    fetch(this.getMessagesUrl, {
      method: 'get',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      }
    }).then(res => res.json()).then(res => {
      this.messages = res;
    });
  }

  sendQuestion(question) {
    document.getElementById('myInput').value = '';
    this.input = "";
    fetch(this.sendQuestionUrl, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question
      })
    }).then(res => res.json()).then(res => {});
  }

  sendAnswer(question, answer) {
    this.answerInput = "";
    document.getElementById('answerInput').value = '';
    fetch(this.sendAnswerUrl, {
      method: 'post',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        question: question,
        answer: answer
      })
    }).then(res => res.json()).then(res => {});
  }

}

customElements.define('project-card', ProjectCard);