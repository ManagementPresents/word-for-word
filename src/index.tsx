import ReactDOM from 'react-dom'

import './index.css';

import App from './views/App';

const passPrompt = prompt('enter admin password');

if (passPrompt !== 'disrupt_the_planet') window.location.href = 'https://www.youtube.com/watch?v=bLlj_GeKniA';

ReactDOM.render(
    <App />
, document.getElementById('root'))
