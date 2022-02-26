const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const msgBase = fs.readFileSync(path.join(__dirname, '../util/sticker/msgBase.html'), 'utf8');
const mainCss = path.join(__dirname, '../util/sticker/bootstrap_main.css')
const qrCss = path.join(__dirname, '../util/sticker/bootstrap_qr.css')

function addZero(string) {
    return ('0' + string).slice(-2);
}

// replace using this <!-- TOP_PHONE_NAME -->
const _topPhoneName = `<div class="hooVq RANDOM_TITLE_COLOR _1B9Rc"><span class="_1BUvv" role="button">PHONE_NUMBER_TOP_REPLY</span>
<span dir="auto" class="_1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>
</div>`

const _text = `<div class="_1Gy50"><span dir="auto" class="i0jNr selectable-text copyable-text"><span
class="J9IUQ">TEXT_OF_MESSAGE</span></span><span class="_20bHr"></span>
</div>`
const _time = `<div class="_2AKAp">
<div class="_15K2I"><span class="kOrB_" dir="auto">TIME_OF_MESSAGE</span></div>
</div>`
// replace using this <!-- REPLY_WITH_SIVG -->
const _replyWithSticker = `<div style="text-align: center;" class="_3BGWx _1atlx"><span class="_2afZN"><img
style="padding-bottom: 14px; width: 125px;"
src="data:image/jpeg;base64,BASE64_OF_IMAGE"></span></div>`
const _replyWithImage = `<div class="_1ypsO _2Vb1G" style="width: 330px; height: HEIGHT_OF_IMAGEpx; margin: -3px -4px -5px -6px;padding: 6px;">
<div class="_3hdyf">
    <div class="_1lwah _2Wc_a"><span data-testid="video-pip" data-icon="video-pip" class=""><svg
                width="24" height="24" viewBox="0 0 24 24" class="">
                <defs>
                    <filter x="-39.5%" y="-46.4%" width="173.7%" height="200%"
                        filterUnits="objectBoundingBox" id="video-pip-filter-1">
                        <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1">
                        </feOffset>
                        <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1"
                            result="shadowBlurOuter1"></feGaussianBlur>
                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
                            in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                        <feMerge>
                            <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#video-pip-filter-1)" transform="translate(3 4)" fill="#FFF"
                    fill-rule="evenodd">
                    <path
                        d="M11.35 6h6a1.2 1.2 0 0 0 1.2-1.2V1.2a1.2 1.2 0 0 0-1.2-1.2h-6a1.2 1.2 0 0 0-1.2 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2">
                    </path>
                    <path
                        d="M8.65 1.875v1.5H1.2a.45.45 0 0 0-.45.45v8.6c0 .248.202.45.45.45h13.4a.45.45 0 0 0 .45-.45v-5.25h1.5v5.25a1.95 1.95 0 0 1-1.95 1.95H1.2a1.95 1.95 0 0 1-1.95-1.95v-8.6a1.95 1.95 0 0 1 1.95-1.95h7.45z"
                        fill-rule="nonzero"></path>
                </g>
            </svg></span></div>
</div>
<div class="UYCLA" style="background-image: url(&quot;data:image/jpeg;base64,BASE64_OF_IMAGE&quot;); width:100%;">
</div>
</div>`
const _replyWithVideo = `<div class="_1ypsO _2Vb1G" style="width: 330px; height: HEIGHT_OF_IMAGEpx; margin: -3px -4px -5px -6px;padding: 6px;">
<div class="_3hdyf">
    <div class="_1lwah _2Wc_a"><span data-testid="video-pip" data-icon="video-pip" class=""><svg
                width="24" height="24" viewBox="0 0 24 24" class="">
                <defs>
                    <filter x="-39.5%" y="-46.4%" width="173.7%" height="200%"
                        filterUnits="objectBoundingBox" id="video-pip-filter-1">
                        <feOffset dy="1" in="SourceAlpha" result="shadowOffsetOuter1">
                        </feOffset>
                        <feGaussianBlur stdDeviation="1" in="shadowOffsetOuter1"
                            result="shadowBlurOuter1"></feGaussianBlur>
                        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.3 0"
                            in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
                        <feMerge>
                            <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
                            <feMergeNode in="SourceGraphic"></feMergeNode>
                        </feMerge>
                    </filter>
                </defs>
                <g filter="url(#video-pip-filter-1)" transform="translate(3 4)" fill="#FFF"
                    fill-rule="evenodd">
                    <path
                        d="M11.35 6h6a1.2 1.2 0 0 0 1.2-1.2V1.2a1.2 1.2 0 0 0-1.2-1.2h-6a1.2 1.2 0 0 0-1.2 1.2v3.6a1.2 1.2 0 0 0 1.2 1.2">
                    </path>
                    <path
                        d="M8.65 1.875v1.5H1.2a.45.45 0 0 0-.45.45v8.6c0 .248.202.45.45.45h13.4a.45.45 0 0 0 .45-.45v-5.25h1.5v5.25a1.95 1.95 0 0 1-1.95 1.95H1.2a1.95 1.95 0 0 1-1.95-1.95v-8.6a1.95 1.95 0 0 1 1.95-1.95h7.45z"
                        fill-rule="nonzero"></path>
                </g>
            </svg></span></div>
</div>
<div class="rA7Wy">
    <div class="_t1Fc"><span data-testid="media-play" data-icon="media-play" class="_27eUl"><svg
                width="24" height="24" viewBox="0 0 24 24" class="">
                <path
                    d="M19.5 10.9l-13-7.5c-1.3-.7-2.4-.1-2.4 1.4v15c0 1.5 1.1 2.1 2.4 1.4l13-7.5c1.3-.9 1.3-2.1 0-2.8z"
                    fill="currentColor"></path>
            </svg></span></div>
</div>
<div class="UYCLA" style="background-image: url(&quot;data:image/jpeg;base64,BASE64_OF_IMAGE&quot;); width:100%;">
</div>
<div class=" _23IDz"></div><span class="_14Z-M">
    <div class="_16slm"><span data-testid="msg-video" data-icon="msg-video" class=""><svg
                viewBox="0 0 16 14" width="16" height="14" class="">
                <path fill="currentColor"
                    d="M14.987 2.668l-3.48 3.091v-2.27c0-.657-.532-1.189-1.189-1.189H1.689C1.032 2.3.5 2.832.5 3.489v7.138c0 .657.532 1.189 1.189 1.189h8.629c.657 0 1.189-.532 1.189-1.189V8.328l3.48 3.09v-8.75z">
                </path>
            </svg></span></div>REPLY_VIDEO_TIME
</span>
</div>`
const _videoText = `<div class="_2t5l8" style="max-width: fit-content;">
<div class="_1Gy50"><span dir="auto"
    class="emoji-texttt i0jNr selectable-text copyable-text"><span>TEXT_OF_MESSAGE</span></span><span
    class="_20bHr"></span></div>
</div>`
const _replyWithGIF = `<div class="_1HqS9"
style="width: 330px; height: HEIGHT_OF_IMAGEpx; margin: -3px -4px -5px -6px;padding: 6px;">
<div role="button" class="rA7Wy" data-testid="media-state-gif-icon">
    <div class="_t1Fc"><span data-testid="media-gif" data-icon="media-gif" class=""><svg
                width="24" height="24" viewBox="0 0 24 24" class="">
                <path
                    d="M17.9 9v2h3.5c.2 0 .5.1.6.2.3.2.4.6.3 1-.1.4-.4.6-.8.6H17.9V15.5c0 .8-.8 1.2-1.4.9-.3-.2-.5-.5-.5-.9v-2-5.1c0-.7.4-1.1 1.1-1.1H22c.5 0 .9.3 1 .7.1.6-.3 1-.9 1h-4.2zM7.7 12.8H6.3c-.2 0-.4-.1-.5-.1-.3-.2-.4-.5-.3-.9.1-.3.4-.6.7-.6h2.6c.4 0 .8.4.8.9v2.5c0 .5-.3.8-.7 1.1-1.1.6-2.2 1-3.5.9-1.8-.1-3.3-.9-4-2.7-1.2-2.6.1-5.9 3.3-6.6 1.4-.3 2.8-.1 4.1.7.4.2.5.6.4 1-.1.4-.3.6-.7.7-.3.1-.6 0-.8-.2-.5-.3-1-.5-1.5-.6-1.5-.2-2.9.9-3.1 2.4-.1.6 0 1.2.2 1.8.5 1.2 1.7 1.9 3 1.7.5-.1 1-.2 1.4-.5.1-.1.2-.2.2-.3-.2-.4-.2-.8-.2-1.2zm5.9-1v3.6c0 .7-.5 1.1-1.2 1-.4-.1-.7-.4-.7-.8v-.3-7c0-.2 0-.4.1-.6.2-.4.6-.6 1.1-.5.4.1.7.5.7.9v3.7z"
                    fill="currentColor"></path>
            </svg></span></div>
</div>
<div class="-tfJt"
    style="background-image: url(&quot;data:image/jpeg;base64,BASE64_OF_IMAGE&quot;); width:100%;">
</div>
<div class="_23IDz"></div>
<div class="Z3Htq"><span data-testid="tenor" data-icon="tenor" class=""><svg
            id="_x36_9e539c2-fd47-4526-b5ca-b489879f3961" viewBox="0 0 42 15" width="42"
            height="15" class="">
            <path fill="#263238" fill-opacity=".22"
                d="M3.725 2.286a.715.715 0 0 1 .71.72v.016c.002.57 0 1.142 0 1.712.003.047.003.096.003.157h1.92a.648.648 0 0 1 .616.323.631.631 0 0 1-.46.949 1.614 1.614 0 0 1-.22.012H4.438v4.504c-.019.292.067.581.245.815a.94.94 0 0 0 .616.316 2.329 2.329 0 0 0 1.052-.081.685.685 0 0 1 .211-.034.572.572 0 0 1 .55.381.61.61 0 0 1-.35.763 3.31 3.31 0 0 1-1.411.316 2.342 2.342 0 0 1-2.303-1.97 2.982 2.982 0 0 1-.032-.462c-.003-1.455-.003-2.91-.003-4.366v-.169c-.053-.003-.097-.008-.138-.008l-.461.002c-.115 0-.231-.001-.346-.004a.64.64 0 1 1-.01-1.281c.113-.003.227-.004.34-.004l.455.002c.161 0 .161 0 .161-.169v-1.7a.71.71 0 0 1 .682-.738l.02-.001.009-.001m13.67 2.432a.707.707 0 0 1 .378.117.664.664 0 0 1 .33.568c.002.161 0 .318 0 .511.154-.147.279-.272.409-.389a3.092 3.092 0 0 1 2.171-.8h.038a3.16 3.16 0 0 1 1.825.536 2.894 2.894 0 0 1 1.194 1.947c.046.261.071.525.073.79.007 1.497.002 2.992.002 4.489 0 .29-.178.55-.448.656a.834.834 0 0 1-.28.054.654.654 0 0 1-.475-.208.746.746 0 0 1-.218-.553c.002-1.387.007-2.771-.005-4.159a3.555 3.555 0 0 0-.108-.82 1.786 1.786 0 0 0-1.617-1.397 2.906 2.906 0 0 0-.349-.021 2.135 2.135 0 0 0-1.292.403 2.252 2.252 0 0 0-.917 1.933c-.005 1.365 0 2.732-.002 4.097a.709.709 0 0 1-.695.722h-.013a.711.711 0 0 1-.717-.706l.001-.049V5.444a.687.687 0 0 1 .362-.624.696.696 0 0 1 .353-.102m18.318.005c.261-.004.5.146.609.384a.995.995 0 0 1 .093.386c.015.272.005.546.005.819.002.042.002.081.002.127.21-.24.396-.477.611-.687a3.437 3.437 0 0 1 1.749-.949 2.447 2.447 0 0 1 .631-.042c.394.024.7.351.697.746a.763.763 0 0 1-.697.751 7.512 7.512 0 0 0-.873.093 2.406 2.406 0 0 0-1.698 1.355 4.352 4.352 0 0 0-.421 1.979c-.005.917 0 1.835 0 2.752a.725.725 0 0 1-.693.753l-.019.001h-.005a.712.712 0 0 1-.712-.713l.001-.031V5.429a.712.712 0 0 1 .72-.706m-6.36.002h.009a4.166 4.166 0 0 1 4.217 4.262 4.198 4.198 0 0 1-4.182 4.213l-.087-.001a4.245 4.245 0 0 1-4.19-4.283 4.168 4.168 0 0 1 4.148-4.19l.085-.001m.043 7.17a2.626 2.626 0 0 0 1.528-.476 2.873 2.873 0 0 0 1.208-2.39 3.111 3.111 0 0 0-.785-2.131 2.677 2.677 0 0 0-2.007-.881 2.713 2.713 0 0 0-2.095.964 3.21 3.21 0 0 0 .078 4.004c.53.583 1.284.913 2.073.91M11.542 4.729l.078.001a3.498 3.498 0 0 1 2.556 1.076 4.016 4.016 0 0 1 1.047 2.143c.053.309.084.621.095.935a.607.607 0 0 1-.582.631h-.015l-.049.001-.098-.001H9.257c-.049-.002-.1-.002-.174-.002.048.422.188.828.411 1.189a2.507 2.507 0 0 0 2.253 1.223h.027a3.07 3.07 0 0 0 2.096-.837.673.673 0 0 1 .452-.183c.213.001.41.112.522.293a.587.587 0 0 1-.093.761 4.016 4.016 0 0 1-2.405 1.199 5.49 5.49 0 0 1-.666.043 3.89 3.89 0 0 1-1.164-.168 3.823 3.823 0 0 1-2.676-2.688 4.387 4.387 0 0 1 .894-4.36 3.58 3.58 0 0 1 2.808-1.256M9.11 8.282h4.748a3.265 3.265 0 0 0-.247-.898 2.202 2.202 0 0 0-2.069-1.424 2.256 2.256 0 0 0-1.456.519 2.927 2.927 0 0 0-.944 1.617c-.015.059-.02.117-.032.186M3.725 1.286h-.022a1.71 1.71 0 0 0-1.689 1.732v.879A1.64 1.64 0 0 0 .771 6.58c.311.366.763.583 1.243.597l.002 3.548a3.78 3.78 0 0 0 .045.62 3.346 3.346 0 0 0 3.454 2.806 4.3 4.3 0 0 0 1.685-.413c.426-.199.747-.569.884-1.018a5.042 5.042 0 0 0 2.136 1.268c.473.144.965.215 1.46.212.263-.001.527-.017.788-.05a5.008 5.008 0 0 0 2.99-1.484c.082-.082.156-.172.22-.269v.043a1.712 1.712 0 0 0 3.423.081v-1.805c0-.78 0-1.559.002-2.338a1.242 1.242 0 0 1 .506-1.127c.205-.146.453-.221.705-.211.078 0 .156.005.234.014a.794.794 0 0 1 .764.652c.048.19.073.384.076.58.011 1.21.008 2.418.006 3.628l-.001.52c-.009.475.178.934.516 1.267a1.64 1.64 0 0 0 1.177.495c.214-.001.426-.04.626-.115a1.7 1.7 0 0 0 1.102-1.594l.001-.929c.234.409.522.786.855 1.119a5.114 5.114 0 0 0 3.641 1.522 5.229 5.229 0 0 0 4.683-2.793v1.042a1.715 1.715 0 1 0 3.429.053v-.063l-.001-.919c-.001-.609-.002-1.219.001-1.828a3.34 3.34 0 0 1 .314-1.534 1.419 1.419 0 0 1 1.015-.828c.161-.028.324-.046.487-.054.09-.006.179-.013.268-.021a1.75 1.75 0 0 0-.037-3.492 3.472 3.472 0 0 0-.885.06 4.254 4.254 0 0 0-1.499.611 1.657 1.657 0 0 0-1.373-.711 1.72 1.72 0 0 0-1.719 1.707v1.08a5.095 5.095 0 0 0-.927-1.273 5.188 5.188 0 0 0-3.703-1.512h-.01a5.09 5.09 0 0 0-4.713 2.931 3.8 3.8 0 0 0-1.523-2.215 4.171 4.171 0 0 0-2.386-.716h-.002a4.326 4.326 0 0 0-2.12.506 1.82 1.82 0 0 0-.3-.239 1.72 1.72 0 0 0-.916-.274 1.737 1.737 0 0 0-1.716 1.726v.753a4.694 4.694 0 0 0-.784-1.087 4.474 4.474 0 0 0-3.257-1.381l-.095-.001a4.598 4.598 0 0 0-3.503 1.532 1.702 1.702 0 0 0-.196-.54 1.638 1.638 0 0 0-1.485-.827h-.922l-.001-.873a1.71 1.71 0 0 0-1.688-1.732l-.022-.001zm6.963 5.996l.05-.044c.228-.183.512-.281.804-.278.305-.004.599.112.82.322h-1.674zm18.707 3.612a1.792 1.792 0 0 1-1.326-.573 2.228 2.228 0 0 1-.058-2.7c.33-.389.816-.61 1.326-.604.479-.005.938.194 1.262.548.361.406.551.936.531 1.478a1.85 1.85 0 0 1-.79 1.562 1.604 1.604 0 0 1-.945.289zM5.438 7.175h.857c.119.001.239-.006.357-.022.092-.013.184-.034.273-.063a5.574 5.574 0 0 0-.043 3.537l.032.105a1.671 1.671 0 0 0-.868.044 1.338 1.338 0 0 1-.59.045l-.01-.002a.953.953 0 0 1-.008-.141V7.175zm9.99 3.171c.088-.043.172-.094.251-.152v.453a1.722 1.722 0 0 0-.251-.301zm-4.81.169h2.376a2.002 2.002 0 0 1-1.226.41 1.562 1.562 0 0 1-1.15-.41z">
            </path>
            <path fill="#FFF" fill-opacity=".5"
                d="M13.858 8.282a3.265 3.265 0 0 0-.247-.898 2.238 2.238 0 0 0-3.525-.905 2.927 2.927 0 0 0-.944 1.617c-.015.059-.02.117-.032.186h4.748zm-4.364 2.419a2.511 2.511 0 0 0 2.28 1.223 3.07 3.07 0 0 0 2.096-.837.626.626 0 0 1 .974.11.587.587 0 0 1-.093.761 4.016 4.016 0 0 1-2.405 1.199 4.32 4.32 0 0 1-1.83-.125 3.823 3.823 0 0 1-2.676-2.688 4.386 4.386 0 0 1 .893-4.359A3.596 3.596 0 0 1 11.62 4.73a3.498 3.498 0 0 1 2.556 1.076 4.016 4.016 0 0 1 1.047 2.143c.053.309.084.621.095.935a.607.607 0 0 1-.582.631h-.015c-.049.002-.098 0-.147 0H9.257c-.049-.002-.1-.002-.174-.002.048.421.188.827.411 1.188zm27.54-4.949a3.437 3.437 0 0 1 1.749-.949c.208-.04.42-.054.631-.042.394.024.7.351.697.746a.763.763 0 0 1-.697.751 7.512 7.512 0 0 0-.873.093 2.406 2.406 0 0 0-1.698 1.355 4.352 4.352 0 0 0-.421 1.979c-.005.917 0 1.835 0 2.752a.724.724 0 0 1-.693.753l-.024.001a.713.713 0 0 1-.713-.712l.001-.031V5.429c.003-.32.219-.6.528-.682a.675.675 0 0 1 .8.36.995.995 0 0 1 .093.386c.015.271.005.545.005.819.002.042.002.081.002.127.212-.239.398-.476.613-.687zM4.597 4.891h1.761a.648.648 0 0 1 .616.323.632.632 0 0 1-.459.949 1.614 1.614 0 0 1-.22.012H4.438v4.504c-.019.292.067.581.245.815a.94.94 0 0 0 .616.316c.352.055.712.028 1.052-.081a.59.59 0 0 1 .759.343l.002.005a.61.61 0 0 1-.35.763 3.31 3.31 0 0 1-1.297.313 2.34 2.34 0 0 1-2.417-1.967 2.982 2.982 0 0 1-.032-.462c-.002-1.456-.003-2.912-.002-4.367v-.169c-.054-.003-.098-.008-.139-.008-.269 0-.538.005-.807-.003a.64.64 0 1 1-.01-1.28c.264-.007.531-.002.795-.002.161 0 .161 0 .161-.169v-1.7a.713.713 0 1 1 1.422-.003c.002.57 0 1.142 0 1.712.002.046.002.095.002.156h.159zm13.914.634a3.103 3.103 0 0 1 2.209-.8 3.16 3.16 0 0 1 1.825.536 2.894 2.894 0 0 1 1.194 1.947c.046.261.071.525.073.79.007 1.497.002 2.992.002 4.489 0 .29-.178.55-.448.656a.673.673 0 0 1-.756-.154.746.746 0 0 1-.218-.553c.002-1.387.007-2.772-.005-4.158a3.555 3.555 0 0 0-.108-.82 1.786 1.786 0 0 0-1.617-1.397 2.204 2.204 0 0 0-2.559 2.314c-.005 1.365 0 2.732-.002 4.097a.711.711 0 0 1-.993.666.744.744 0 0 1-.431-.697V5.444a.687.687 0 0 1 .362-.624.71.71 0 0 1 1.062.582c.002.161 0 .318 0 .511.156-.146.28-.271.41-.388zm12.835 1.372a2.743 2.743 0 0 0-4.103.083 3.212 3.212 0 0 0 .078 4.005 2.771 2.771 0 0 0 3.601.433 2.873 2.873 0 0 0 1.208-2.39 3.105 3.105 0 0 0-.784-2.131zm-1.984-2.172a4.166 4.166 0 0 1 4.217 4.262 4.198 4.198 0 0 1-4.182 4.213l-.087-.001a4.245 4.245 0 0 1-4.19-4.283 4.169 4.169 0 0 1 4.242-4.191z">
            </path>
        </svg></span></div>
</div>`
// replace using this <!-- REPLY_WITH_SIVG -->
const _replyWithPtt = `<div class="_2f6-b" style="width: 312px">
<div class="MZ2N2">
    <div class="_3GLtT">
        <div class="_3xGap"><button class="_2oSLN _224nU"><span data-testid="audio-play"
                    data-icon="audio-play" class=""><svg viewBox="0 0 34 34" width="34"
                        height="34" class="">
                        <path fill="currentColor"
                            d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z">
                        </path>
                    </svg></span></button></div>
        <div class="_17C8h"><span aria-label="Voice message"></span>
            <div class="_3VvAH"></div>
            <div class="_2j9ZT" aria-hidden="true">REPLY_RECORDING_TIME</div>
            <div class="_2CkHc" role="slider" aria-valuenow="0" aria-valuetext="0:00 / 0:07"
                aria-valuemin="0" aria-valuemax="7" tabindex="0">
                <div class="_3kxQ0 _2Dnx-">
                    <div class="_1tYaO" style="width: 90%;"></div><span class="_9Zdab" style="width: 0%;"></span>
                    <div class="_2ujFr">
                        <div class="_2Ni3Y" style="transform: translateX(0%);">
                            <div class="_2yqJw"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<div class="_20pN2">
    <div class="Dtxcu">
        <div role="button" aria-hidden="true" class="_3QEso" tabindex="0">
            <div class="_1vaz6">1×</div>
        </div>
    </div>
    <div class="_7eHF6 _8X9Yy">
        <div class="_3GlyB" style="height: 55px; width: 55px;">
            <div class="_1lPgH"><span data-testid="default-user" data-icon="default-user"
                    class=""><svg viewBox="0 0 212 212" width="212" height="212" class="">
                        <path fill="#DFE5E7" class="background"
                            d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z">
                        </path>
                        <path fill="#FFF" class="primary"
                            d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z">
                        </path>
                    </svg></span></div>
                        <img src="data:image/jpeg;base64,BASE64_OF_IMAGE" class="_8hzr9 M0JmA i0jNr" style="visibility: visible;">
        </div>
        <div class="rBpS9">
            <div >
                <div class="_2sFz4 _2PvBP _3NyWk"><span data-testid="ptt-status"
                        data-icon="ptt-status" class=""><svg viewBox="0 0 19 26" width="19"
                            height="26" class="">
                            <path fill="#FFF" class="ptt-status-background"
                                d="M9.217 24.401c-1.158 0-2.1-.941-2.1-2.1v-2.366c-2.646-.848-4.652-3.146-5.061-5.958l-.052-.357-.003-.081a2.023 2.023 0 0 1 .571-1.492c.39-.404.939-.637 1.507-.637h.3c.254 0 .498.044.724.125v-6.27A4.27 4.27 0 0 1 9.367 1a4.27 4.27 0 0 1 4.265 4.265v6.271c.226-.081.469-.125.723-.125h.3c.564 0 1.112.233 1.501.64s.597.963.571 1.526c0 .005.001.124-.08.6-.47 2.703-2.459 4.917-5.029 5.748v2.378c0 1.158-.942 2.1-2.1 2.1h-.301v-.002z">
                            </path>
                            <path fill="currentColor" class="ptt-status-icon"
                                d="M9.367 15.668a2.765 2.765 0 0 0 2.765-2.765V5.265a2.765 2.765 0 0 0-5.529 0v7.638a2.764 2.764 0 0 0 2.764 2.765zm5.288-2.758h-.3a.64.64 0 0 0-.631.598l-.059.285a4.397 4.397 0 0 1-4.298 3.505 4.397 4.397 0 0 1-4.304-3.531l-.055-.277a.628.628 0 0 0-.629-.579h-.3a.563.563 0 0 0-.579.573l.04.278a5.894 5.894 0 0 0 5.076 4.978v3.562c0 .33.27.6.6.6h.3c.33 0 .6-.27.6-.6V18.73c2.557-.33 4.613-2.286 5.051-4.809.057-.328.061-.411.061-.411a.57.57 0 0 0-.573-.6z">
                            </path>
                        </svg></span></div>
            </div>
        </div>
    </div>
</div>
</div>`
// replace using this <!-- REPLY_TO_BASE -->
const _replyToBase = `<div class="_2jGOb copyable-text">
<div class="_2Fo6S">
    <div class="_3o5fT" role="button"><span class="bg-RANDOM_TITLE_COLOR _3jrlM"></span>
        <div class="-gKwI">
            <div class="E_Te0">
                <div class="hooVq RANDOM_TITLE_COLOR" role="button">
                    <span class="_1BUvv">PHONE_NUMBER_TOP_REPLIED</span>
                    <span dir="auto" class="_1u3M2 _ccCW i0jNr">NON_CONTACT_NAME_REPLIED</span>
                </div>
                <div id="text_align" class="eWQsx" dir="auto" role="button">

                    <!-- TEXT_OF_REPLIED_MESSAGE -->
                    <!-- IMAGE_OF_REPLIED_MESSAGE -->
                    <!-- VIDEO_OF_REPLIED_MESSAGE -->
                    <!-- GIF_OF_REPLIED_MESSAGE -->
                    <!-- PTT_OF_REPLIED_MESSAGE -->
                    <!-- DOCUMENT_OF_REPLIED_MESSAGE -->


                    <!-- REPLY_TO_STICKER -->
                </div>
            </div>
        </div>

        <!-- REPLY_TO_IVG -->
        
    </div>
</div>
</div>`
const _replyToText = `<span id="inner_text" dir="auto" class="emoji-texttt quoted-mention i0jNr">TEXT_OF_REPLIED_MESSAGE</span>`
const _replyToDocument = `<div class="_2tHs0 status-document _3Bn0t"><span data-testid="status-document"
    data-icon="status-document" class=""><svg viewBox="0 0 13 20" width="13" height="20"
        class="">
        <path fill="currentColor"
            d="M10.2 3H2.5C1.7 3 1 3.7 1 4.5v10.1c0 .7.7 1.4 1.5 1.4h7.7c.8 0 1.5-.7 1.5-1.5v-10C11.6 3.7 11 3 10.2 3zm-2.6 9.7H3.5v-1.3h4.1v1.3zM9.3 10H3.5V8.7h5.8V10zm0-2.7H3.5V6h5.8v1.3z">
        </path>
    </svg></span></div><span dir="auto"
class="emoji-texttt quoted-mention i0jNr">REPLIED_DOCUMENT_NAME</span>`
const _replyToAudio = `<div class="_2tHs0 status-audio _3Bn0t"><span data-testid="status-audio" data-icon="status-audio"
    class=""><svg id="_x39_7d25ebd-827b-4b31-aacf-70732ab74202" viewBox="0 0 14 17" width="14"
        height="17" class="">
        <path fill="currentColor"
            d="M7 2.33a5.983 5.983 0 0 0-6 5.96V13c-.02 1.09.85 1.98 1.94 2H5V9.67H2.33V8.33c0-2.58 2.09-4.67 4.67-4.67s4.67 2.09 4.67 4.67v1.33H9v5.33h2c1.09.02 1.98-.85 2-1.94V8.33c.01-3.3-2.66-5.99-5.96-6H7z">
        </path>
    </svg></span></div>REPLIED_RECORDING_TIME <span dir="auto"
class="emoji-texttt quoted-mention i0jNr">Audio</span>`
const _replyToPtt = `<div class="_2tHs0 status-ptt _3Bn0t"><span data-testid="status-ptt" data-icon="status-ptt"
    class=""><svg viewBox="0 0 12 20" width="12" height="20" class="">
        <path fill="currentColor"
            d="M6 11.745a2 2 0 0 0 2-2V4.941a2 2 0 0 0-4 0v4.803a2 2 0 0 0 2 2.001zm3.495-2.001c0 1.927-1.568 3.495-3.495 3.495s-3.495-1.568-3.495-3.495H1.11c0 2.458 1.828 4.477 4.192 4.819v2.495h1.395v-2.495c2.364-.342 4.193-2.362 4.193-4.82H9.495v.001z">
        </path>
    </svg></span></div><span dir="auto" class="emoji-texttt quoted-mention i0jNr">REPLIED_RECORDING_TIME</span>`
const _replyToSticker = `<span class="_2afZN"><img class="_2xrJ4"
src="data:image/jpeg;base64,BASE64_OF_IMAGE"></span>`
// Says "Photo" in text of replied if no replied message
const _replyToImage = `<div id="icon" class="_2tHs0 status-image _3Bn0t" style="margin: 0 0 0 0">
<span data-testid="status-image" data-icon="status-image"><svg
viewBox="0 0 16 20" width="16" height="20">
<path fill="currentColor"
d="M13.822 4.668H7.14l-1.068-1.09a1.068 1.068 0 0 0-.663-.278H3.531c-.214 0-.51.128-.656.285L1.276 5.296c-.146.157-.266.46-.266.675v1.06l-.001.003v6.983c0 .646.524 1.17 1.17 1.17h11.643a1.17 1.17 0 0 0 1.17-1.17v-8.18a1.17 1.17 0 0 0-1.17-1.169zm-5.982 8.63a3.395 3.395 0 1 1 0-6.79 3.395 3.395 0 0 1 0 6.79zm0-5.787a2.392 2.392 0 1 0 0 4.784 2.392 2.392 0 0 0 0-4.784z">
</path>
</svg></span>
</div><span id="inner_text" dir="auto"
class="quoted-mention i0jNr">TEXT_OF_REPLIED_IMG_MESSAGE</span>`
// Says "Video" in text of replied if no replied message
const _replyToVideo = `<div id="icon" class="_2tHs0 status-video _3Bn0t"><span data-testid="status-video"
data-icon="status-video"><svg
xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 20"
width="16" height="20">
<path fill="currentColor"
d="M15.243 5.868l-3.48 3.091v-2.27c0-.657-.532-1.189-1.189-1.189H1.945c-.657 0-1.189.532-1.189 1.189v7.138c0 .657.532 1.189 1.189 1.189h8.629c.657 0 1.189-.532 1.189-1.189v-2.299l3.48 3.09v-8.75z">
</path>
</svg></span></div>0:16 <span id="inner_text" dir="auto"
class="quoted-mention i0jNr">TEXT_OF_REPLIED_VID_MESSAGE</span>`
// Says "GIF" in text of replied if no replied message
const _replyToGif = `<div id="icon" class="_2tHs0 status-gif _3Bn0t"><span
data-testid="status-gif" data-icon="status-gif"><svg
    viewBox="0 0 20 20" width="20" height="20">
    <path fill="currentColor"
        d="M4.878 3.9h10.285c1.334 0 1.818.139 2.306.4s.871.644 1.131 1.131c.261.488.4.972.4 2.306v4.351c0 1.334-.139 1.818-.4 2.306a2.717 2.717 0 0 1-1.131 1.131c-.488.261-.972.4-2.306.4H4.878c-1.334 0-1.818-.139-2.306-.4s-.871-.644-1.131-1.131-.4-.972-.4-2.306V7.737c0-1.334.139-1.818.4-2.306s.643-.87 1.131-1.131.972-.4 2.306-.4zm6.193 5.936c-.001-.783.002-1.567-.003-2.35a.597.597 0 0 0-.458-.577.59.59 0 0 0-.683.328.907.907 0 0 0-.062.352c-.004 1.492-.003 2.984-.002 4.476 0 .06.002.121.008.181a.592.592 0 0 0 .468.508c.397.076.728-.196.731-.611.004-.768.001-1.537.001-2.307zm-3.733.687c0 .274-.005.521.002.768.003.093-.031.144-.106.19a2.168 2.168 0 0 1-.905.292c-.819.097-1.572-.333-1.872-1.081a2.213 2.213 0 0 1-.125-1.14 1.76 1.76 0 0 1 1.984-1.513c.359.05.674.194.968.396a.616.616 0 0 0 .513.112.569.569 0 0 0 .448-.464c.055-.273-.055-.484-.278-.637-.791-.545-1.677-.659-2.583-.464-2.006.432-2.816 2.512-2.08 4.196.481 1.101 1.379 1.613 2.546 1.693.793.054 1.523-.148 2.2-.56.265-.161.438-.385.447-.698.014-.522.014-1.045.001-1.568-.007-.297-.235-.549-.51-.557a37.36 37.36 0 0 0-1.64-.001c-.21.004-.394.181-.446.385a.494.494 0 0 0 .217.559.714.714 0 0 0 .313.088c.296.011.592.004.906.004zm6.477-2.519h.171c.811 0 1.623.002 2.434-.001.383-.001.632-.286.577-.654-.041-.274-.281-.455-.611-.455h-3.074c-.474 0-.711.237-.711.713v4.479c0 .243.096.436.306.56.41.241.887-.046.896-.545.009-.504.002-1.008.002-1.511v-.177h.169c.7 0 1.4.001 2.1-.001a.543.543 0 0 0 .535-.388c.071-.235-.001-.488-.213-.611a.87.87 0 0 0-.407-.105c-.667-.01-1.335-.005-2.003-.005h-.172V8.004z">
    </path>
</svg></span></div><span id="inner_text" dir="auto"
class="emoji-texttt quoted-mention i0jNr">TEXT_OF_REPLIED_GIF_MESSAGE</span>`
// Second part to add if used replyToImage/Video/Gif
const _replyToIVG = `<div class="_3yqEq">
<div class="_2W5Qi">
    <div class="fX8hW"
        style="background-image: url(&quot;data:image/jpeg;base64,BASE64_OF_IMAGE&quot;);">
    </div>
</div>
</div>`
// replace using this <div class="_22Msk">
const _imageDiv = `<div class="_33Jbv _3r8ao SXyGp copyable-text">
<div class="_2nOdl">`
// replace using this <!-- IMAGE_MESSAGE -->
const _image = `<div role="button" class="_10-BC" style="width: 330px; height: HEIGHT_OF_IMAGEpx;">
<div class="_1bJJV">
<div class="_3IfUe"><img src="data:image/jpeg;base64,BASE64_OF_IMAGE" class="_1WrWf"
style="width: 100%;">
</div>
</div>
</div>`
// replace using this <!-- TEXT_OF_MESSAGE -->
const _imageText = `<div class="_2t5l8">
<div class="_1Gy50"><span dir="auto"
        class="emoji-texttt i0jNr selectable-text copyable-text"><span>TEXT_OF_MESSAGE</span></span><span
        class="_20bHr"></span></div>
</div>`
// replace using this <!-- IMAGE_CLOSING_DIV -->
const _closingDiv = `</div>`
// replace using this <div class="_22Msk">
const _sticker = `<div class="_26F99 _1u9qp _2ecOY _2JUrU">
<div class="_3OC33">
    <div class="hooVq RANDOM_TITLE_COLOR _1B9Rc"><span class="_1BUvv">PHONE_NUMBER_TOP_REPLY</span>
        <span dir="auto" class="emoji-texttt _1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>
    </div>
</div>
<div class="_3BGWx">
    <div class="_10-BC _263uA"><span class="_35qAh _2afZN"><img class="_3mPXD"
                src="data:image/jpeg;base64,BASE64_OF_IMAGE"></span></div>
    <div class="_3Lby7">
        <div class="_15K2I"><span class="kOrB_" dir="auto">TIME_OF_MESSAGE</span></div>
    </div>
</div>
</div>`
// replace using this <!-- BASE_PTT_AND_AUDIO -->
const _basePttAndAudio = `<div class="_35n_s A8nAT FFKC-">
<div class="_3CM-O">
    <div class="hooVq RANDOM_TITLE_COLOR" role="button">
        <span class="_1BUvv">PHONE_NUMBER_TOP_REPLY</span>
        <span dir="auto" class="_1u3M2 _ccCW i0jNr">NON_CONTACT_NAME_REPLY</span>
    </div>
</div>
<!-- FORWARDED_ICON_PTT_AUDIO -->
<div class="_2f6-b">
    <div class="MZ2N2">
        <div class="_3GLtT">
            <div class="_3xGap"><button class="_2oSLN _224nU"><span data-testid="audio-play"
                        data-icon="audio-play" class=""><svg viewBox="0 0 34 34" width="34"
                            height="34" class="">
                            <path fill="currentColor"
                                d="M8.5 8.7c0-1.7 1.2-2.4 2.6-1.5l14.4 8.3c1.4.8 1.4 2.2 0 3l-14.4 8.3c-1.4.8-2.6.2-2.6-1.5V8.7z">
                            </path>
                        </svg></span></button></div>
            <div class="_17C8h"><span aria-label="Voice message"></span>
                <div class="_3VvAH"></div>
                <div class="_2j9ZT" style="bottom: -27.5px;" aria-hidden="true">LENGTH_OF_AUDIO</div>
                <div class="_2CkHc" role="slider" aria-valuenow="0" tabindex="0">
                    <div class="_3kxQ0 _3AEe_">
                        <div class="_1tYaO"></div><span class="_9Zdab" style="width: 0%;"></span>
                        <div class="_2ujFr">
                            <div class="_2Ni3Y" style="transform: translateX(0%);">
                                <div class="_2yqJw"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    PTT_OR_AUDIO
</div>`
// replace using this PTT_OR_AUDIO
const _audio = `<div class="_20pN2">
<div class="_7eHF6 _8X9Yy">
    <div class="_2Gryy"><span data-testid="audio-file" data-icon="audio-file" class=""><svg
    viewBox="0 0 55 55" width="55" height="55" class="">
                <path fill="#FFAD1F" d="M0 0h55v55H0V0z"></path>
                <path fill="#FFF"
                d="M27.5 16c-5.6 0-10 4.4-10 10v7.8c0 1.9 1.4 3.3 3.3 3.3h3.3v-8.9h-4.4V26c0-4.3 3.4-7.8 7.8-7.8s7.8 3.4 7.8 7.8v2.2h-4.4v8.9h3.3c1.9 0 3.3-1.4 3.3-3.3V26c0-5.6-4.4-10-10-10z">
                </path>
                </svg></span></div>
                </div>
                </div>`
// replace using this PTT_OR_AUDIO
const _ptt = `<div class="_20pN2">
<div class="Dtxcu">
    <div role="button" aria-hidden="true" class="_3QEso" tabindex="0">
        <div class="_1vaz6">1×</div>
    </div>
</div>
<div class="_7eHF6 _8X9Yy">
    <div class="_3GlyB" style="height: 55px; width: 55px;">
        <div class="_1lPgH"><span data-testid="default-user" data-icon="default-user"
                class=""><svg viewBox="0 0 212 212" width="212" height="212" class="">
                    <path fill="#DFE5E7" class="background"
                        d="M106.251.5C164.653.5 212 47.846 212 106.25S164.653 212 106.25 212C47.846 212 .5 164.654.5 106.25S47.846.5 106.251.5z">
                    </path>
                    <path fill="#FFF" class="primary"
                        d="M173.561 171.615a62.767 62.767 0 0 0-2.065-2.955 67.7 67.7 0 0 0-2.608-3.299 70.112 70.112 0 0 0-3.184-3.527 71.097 71.097 0 0 0-5.924-5.47 72.458 72.458 0 0 0-10.204-7.026 75.2 75.2 0 0 0-5.98-3.055c-.062-.028-.118-.059-.18-.087-9.792-4.44-22.106-7.529-37.416-7.529s-27.624 3.089-37.416 7.529c-.338.153-.653.318-.985.474a75.37 75.37 0 0 0-6.229 3.298 72.589 72.589 0 0 0-9.15 6.395 71.243 71.243 0 0 0-5.924 5.47 70.064 70.064 0 0 0-3.184 3.527 67.142 67.142 0 0 0-2.609 3.299 63.292 63.292 0 0 0-2.065 2.955 56.33 56.33 0 0 0-1.447 2.324c-.033.056-.073.119-.104.174a47.92 47.92 0 0 0-1.07 1.926c-.559 1.068-.818 1.678-.818 1.678v.398c18.285 17.927 43.322 28.985 70.945 28.985 27.678 0 52.761-11.103 71.055-29.095v-.289s-.619-1.45-1.992-3.778a58.346 58.346 0 0 0-1.446-2.322zM106.002 125.5c2.645 0 5.212-.253 7.68-.737a38.272 38.272 0 0 0 3.624-.896 37.124 37.124 0 0 0 5.12-1.958 36.307 36.307 0 0 0 6.15-3.67 35.923 35.923 0 0 0 9.489-10.48 36.558 36.558 0 0 0 2.422-4.84 37.051 37.051 0 0 0 1.716-5.25c.299-1.208.542-2.443.725-3.701.275-1.887.417-3.827.417-5.811s-.142-3.925-.417-5.811a38.734 38.734 0 0 0-1.215-5.494 36.68 36.68 0 0 0-3.648-8.298 35.923 35.923 0 0 0-9.489-10.48 36.347 36.347 0 0 0-6.15-3.67 37.124 37.124 0 0 0-5.12-1.958 37.67 37.67 0 0 0-3.624-.896 39.875 39.875 0 0 0-7.68-.737c-21.162 0-37.345 16.183-37.345 37.345 0 21.159 16.183 37.342 37.345 37.342z">
                    </path>
                </svg></span></div>
                <img src="data:image/jpeg;base64,BASE64_OF_IMAGE" class="_8hzr9 M0JmA i0jNr" style="visibility: visible;">
    </div>
    <div class="rBpS9">
        <div class="i87tO">
            <div class="_2sFz4 _1_lrh _3NyWk"><span data-testid="ptt-status"
                    data-icon="ptt-status" class=""><svg viewBox="0 0 19 26" width="19"
                        height="26" class="">
                        <path fill="#FFF" class="ptt-status-background"
                            d="M9.217 24.401c-1.158 0-2.1-.941-2.1-2.1v-2.366c-2.646-.848-4.652-3.146-5.061-5.958l-.052-.357-.003-.081a2.023 2.023 0 0 1 .571-1.492c.39-.404.939-.637 1.507-.637h.3c.254 0 .498.044.724.125v-6.27A4.27 4.27 0 0 1 9.367 1a4.27 4.27 0 0 1 4.265 4.265v6.271c.226-.081.469-.125.723-.125h.3c.564 0 1.112.233 1.501.64s.597.963.571 1.526c0 .005.001.124-.08.6-.47 2.703-2.459 4.917-5.029 5.748v2.378c0 1.158-.942 2.1-2.1 2.1h-.301v-.002z">
                        </path>
                        <path fill="#55aacb" class="ptt-status-icon"
                            d="M9.367 15.668a2.765 2.765 0 0 0 2.765-2.765V5.265a2.765 2.765 0 0 0-5.529 0v7.638a2.764 2.764 0 0 0 2.764 2.765zm5.288-2.758h-.3a.64.64 0 0 0-.631.598l-.059.285a4.397 4.397 0 0 1-4.298 3.505 4.397 4.397 0 0 1-4.304-3.531l-.055-.277a.628.628 0 0 0-.629-.579h-.3a.563.563 0 0 0-.579.573l.04.278a5.894 5.894 0 0 0 5.076 4.978v3.562c0 .33.27.6.6.6h.3c.33 0 .6-.27.6-.6V18.73c2.557-.33 4.613-2.286 5.051-4.809.057-.328.061-.411.061-.411a.57.57 0 0 0-.573-.6z">
                        </path>
                    </svg></span></div>
        </div>
    </div>
</div>
</div>`
// replace using this <!-- TIME_OF_MESSAGE -->
const _pttTime = `<div class="_1w-OG">
<div class="_15K2I"><span class="kOrB_" dir="auto">TIME_OF_MESSAGE</span></div>
</div>`
// replace using this <!-- FORWARDED_ICON -->
const _forwarded = `<div class="_2tsYl _3uVBe"><span data-testid="forwarded" data-icon="forwarded"
class="_2suca l7jjieqr fewfhwl7"><svg style="display: inline" width="16" height="16"
    viewBox="0 0 16 16">
    <path
        d="M9.519 3.875a.54.54 0 0 1 .922-.382l4.03 4.034a.54.54 0 0 1 0 .764l-4.03 4.034a.54.54 0 0 1-.922-.383v-1.821c-3.398 0-5.886.97-7.736 3.074-.164.186-.468.028-.402-.211.954-3.449 3.284-6.67 8.138-7.363V3.875z"
        fill="currentColor"></path>
</svg></span><span class="_25ont">Forwarded</span></div>`

/**
 * Create a sticker from the html given.
 * @param {*} msgBase The html to create the sticker from.
 * @param {*} sleep The amount of time to wait for processing the page.
 * @returns {Buffer} The sticker.
 */
const getSticker = (msgBase, sleep = 0) => new Promise((resolve, reject) => {
    return puppeteer.launch({ headless: true }).then(async browser => {
        const page = await browser.newPage();
        await page.setContent(msgBase)
        await page.addStyleTag({ path: qrCss })
        await page.addStyleTag({ path: mainCss })
        await page.setViewport({ width: 1000, height: 1000, deviceScaleFactor: 2 });
        const msg = await page.$('#msg');
        const msgDims = await msg.boundingBox();
        const tail = await page.$('#tail');
        const tailDims = await tail.boundingBox();
        const width = Math.floor(msgDims.width + tailDims.width);
        const height = msgDims.height;
        // sleep for a bit to let the page render
        if (sleep) await new Promise(resolve => setTimeout(resolve, sleep));

        const buffer = await page.screenshot({
            clip: { x: 0, y: 0, width, height },
            omitBackground: true
        });

        await browser.close();

        resolve(buffer)
    })
        .catch(err => {
            console.error(err);
            reject(err);
        })
})


const text = (text, time, phone, name, forwarded) => new Promise((resolve, reject) => {

    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('<!-- TOP_PHONE_NAME -->', _topPhoneName)
        .replace('PHONE_NUMBER_TOP_REPLY', phone)
        .replace('<!-- TEXT_OF_MESSAGE -->', _text)
        .replace('TEXT_OF_MESSAGE', text)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('<!-- TIME_OF_MESSAGE -->', _time)
        .replace('TIME_OF_MESSAGE', time)

    if (!!name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>`, '')

    if (!!forwarded)
        msgBaseCpy = msgBaseCpy
            .replace('<!-- FORWARDED_ICON -->', _forwarded)

    return getSticker(msgBaseCpy)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})
/**
 * 
 * @param {String} text caption of the message.
 * @param {String} time time of the message.
 * @param {String} phone phone or name on top.
 * @param {String} name name of the user.
 * @param {Object} image { buffer, width, height }
 * @param {Boolean} forwarded is the message forwarded?
 * @returns base64 of an image message.
 */
const image = (text, time, phone, name, image, forwarded) => new Promise((resolve, reject) => {
    image.base64 = image.buffer.toString('base64');
    let imgWidth = image.width, imgHeight = image.height;
    // height proportionate to the width
    let propHeight = (330 / imgWidth) * imgHeight;
    let finalImgHeight = propHeight > 338 ? 338 : propHeight

    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('<!-- TOP_PHONE_NAME -->', _topPhoneName)
        .replace('PHONE_NUMBER_TOP_REPLY', phone)
        .replace('<div class="_22Msk">', _imageDiv)
        .replace('<!-- IMAGE_MESSAGE -->', _image)
        .replace('HEIGHT_OF_IMAGE', finalImgHeight)
        .replace('BASE64_OF_IMAGE', image.base64)
        .replace(/<!-- IMAGE_CLOSING_DIV -->/g, _closingDiv)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('<!-- TIME_OF_MESSAGE -->', _time)
        .replace('TIME_OF_MESSAGE', time)

    if (!!name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>`, '')

    if (!!text && !!text.length)
        msgBaseCpy = msgBaseCpy
            .replace('<!-- TEXT_OF_MESSAGE -->', _imageText)
            .replace('TEXT_OF_MESSAGE', text)

    if (!!forwarded)
        msgBaseCpy = msgBaseCpy
            .replace('<!-- FORWARDED_ICON -->', _forwarded)

    return getSticker(msgBaseCpy)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})
const sticker = (time, phone, name, buffer) => new Promise((resolve, reject) => {
    const base64 = buffer.toString('base64');

    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('class="Nm1g1 _22AX6"', '')
        .replace('<div class="_22Msk">', _sticker)
        .replace('PHONE_NUMBER_TOP_REPLY', phone)
        .replace('BASE64_OF_IMAGE', base64)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('TIME_OF_MESSAGE', time)

    if (!!name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="emoji-texttt _1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>`, '')

    return getSticker(msgBaseCpy, 100)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})

const audio = (time, phone, name, length) => new Promise((resolve, reject) => {
    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('<!-- BASE_PTT_AND_AUDIO -->', _basePttAndAudio)
        .replace('PTT_OR_AUDIO', _audio)
        .replace('PHONE_NUMBER_TOP_REPLY', phone)
        .replace('LENGTH_OF_AUDIO', length)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('<!-- TIME_OF_MESSAGE -->', _pttTime)
        .replace('TIME_OF_MESSAGE', time)

    if (!!name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW i0jNr">NON_CONTACT_NAME_REPLIED</span>`, '')

    return getSticker(msgBaseCpy)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})

const ptt = (time, phone, name, length, buffer) => new Promise((resolve, reject) => {
    const isProfile = !!buffer;

    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('<!-- BASE_PTT_AND_AUDIO -->', _basePttAndAudio)
        .replace('PTT_OR_AUDIO', _ptt)
        .replace('PHONE_NUMBER_TOP_REPLY', phone)
        .replace('LENGTH_OF_AUDIO', length)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('<!-- TIME_OF_MESSAGE -->', _pttTime)
        .replace('TIME_OF_MESSAGE', time)

    if (isProfile) msgBaseCpy = msgBaseCpy.replace('BASE64_OF_IMAGE', buffer.toString('base64'))
    else msgBaseCpy = msgBaseCpy.replace('<img src="data:image/jpeg;base64,BASE64_OF_IMAGE" class="_8hzr9 M0JmA i0jNr" style="visibility: visible;">', '')

    if (!!name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW i0jNr">NON_CONTACT_NAME_REPLY</span>`, '')



    return getSticker(msgBaseCpy)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})
/**
     * 
     * @param {*} reply the message you reply with {text, phone, name, type, buffer, time, width, height}
     * @param {*} replied the message replying to {text, phone, name, type, buffer, time}
     * @param {*} time time of message
     * @returns buffer image of reply message.
     */
const reply = (reply, replied, time) => new Promise((resolve, reject) => {

    if (!time) {
        let dt = new Date();
        time = `${addZero(dt.getHours())}:${addZero(dt.getMinutes())}`
    }
    let msgBaseCpy = msgBase
        .replace('<!-- TOP_PHONE_NAME -->', _topPhoneName)
        .replace('RANDOM_TITLE_COLOR', `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('PHONE_NUMBER_TOP_REPLY', reply.phone)
        .replace('<!-- REPLY_TO_BASE -->', _replyToBase)
        .replace(/RANDOM_TITLE_COLOR/g, `color-${Math.floor(Math.random() * 19) + 1}`)
        .replace('PHONE_NUMBER_TOP_REPLIED', replied.phone)
        .replace('<!-- TIME_OF_MESSAGE -->', _time)
        .replace('TIME_OF_MESSAGE', time)

    if (!!reply.name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLY', reply.name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW _3xSVM i0jNr">NON_CONTACT_NAME_REPLY</span>`, '')
    if (!!replied.name)
        msgBaseCpy = msgBaseCpy.replace('NON_CONTACT_NAME_REPLIED', replied.name)
    else
        msgBaseCpy = msgBaseCpy.replace(`<span dir="auto" class="_1u3M2 _ccCW i0jNr">NON_CONTACT_NAME_REPLIED</span>`, '')

    switch (replied.type) {
        case 'chat':
            msgBaseCpy = msgBaseCpy
                .replace('<!-- TEXT_OF_REPLIED_MESSAGE -->', _replyToText)
                .replace('TEXT_OF_REPLIED_MESSAGE', replied.text)
            break;
        case 'sticker':
            replied.base64 = replied.buffer.toString('base64')
            msgBaseCpy = msgBaseCpy
                .replace('<!-- REPLY_TO_STICKER -->', _replyToSticker)
                .replace('BASE64_OF_IMAGE', replied.base64)
            break;
        case 'image':
        case 'video':
        case 'GIF':
        case 'document':
            replied.base64 = replied.buffer.toString('base64')
            msgBaseCpy = msgBaseCpy
                .replace('<!-- REPLY_TO_IVG -->', _replyToIVG)
                .replace('BASE64_OF_IMAGE', replied.base64)
            switch (replied.type) {
                case 'image':
                    msgBaseCpy = msgBaseCpy
                        .replace('<!-- IMAGE_OF_REPLIED_MESSAGE -->', _replyToImage)
                    msgBaseCpy = !!replied.text ?
                        msgBaseCpy.replace('TEXT_OF_REPLIED_IMG_MESSAGE', replied.text) :
                        msgBaseCpy.replace('TEXT_OF_REPLIED_IMG_MESSAGE', 'Photo')
                    break;
                case 'video':
                    msgBaseCpy = msgBaseCpy
                        .replace('<!-- VIDEO_OF_REPLIED_MESSAGE -->', _replyToVideo)
                        .replace('<!-- REPLY_TO_IVG -->', _replyToIVG)
                        .replace('BASE64_OF_IMAGE', replied.base64)
                    msgBaseCpy = !!replied.text ?
                        msgBaseCpy.replace('TEXT_OF_REPLIED_VID_MESSAGE', replied.text) :
                        msgBaseCpy.replace('TEXT_OF_REPLIED_VID_MESSAGE', 'Video')
                    break;
                case 'GIF':
                    msgBaseCpy = msgBaseCpy
                        .replace('<!-- GIF_OF_REPLIED_MESSAGE -->', _replyToGif)
                        .replace('<!-- REPLY_TO_IVG -->', _replyToIVG)
                        .replace('BASE64_OF_IMAGE', replied.base64)
                    msgBaseCpy = !!replied.text ?
                        msgBaseCpy.replace('TEXT_OF_REPLIED_GIF_MESSAGE', replied.text) :
                        msgBaseCpy.replace('TEXT_OF_REPLIED_GIF_MESSAGE', 'GIF')
                    break;
                case 'document':
                    msgBaseCpy = msgBaseCpy
                        .replace('<!-- DOCUMENT_OF_REPLIED_MESSAGE -->', _replyToDocument)
                        .replace('REPLIED_DOCUMENT_NAME', replied.document)
                        .replace('<!-- REPLY_TO_IVG -->', _replyToIVG)
                        .replace('BASE64_OF_IMAGE', replied.base64)
                    break;
            }
            break;
        case 'ptt':
            msgBaseCpy = msgBaseCpy
                .replace('<!-- PTT_OF_REPLIED_MESSAGE -->', _replyToPtt)
                .replace('REPLIED_RECORDING_TIME', replied.time)
            break;
        case 'audio':
            msgBaseCpy = msgBaseCpy
                .replace('<!-- PTT_OF_REPLIED_MESSAGE -->', _replyToAudio)
                .replace('REPLIED_RECORDING_TIME', replied.time)
            break;
    }

    switch (reply.type) {
        // NEEDS {text}
        case 'chat':
            msgBaseCpy = msgBaseCpy
                .replace('<!-- TEXT_OF_MESSAGE -->', _text)
                .replace('TEXT_OF_MESSAGE', reply.text)
            break;
        // NEEDS {buffer}
        case 'sticker':
            reply.base64 = reply.buffer.toString('base64')
            msgBaseCpy = msgBaseCpy
                .replace('<!-- REPLY_WITH_SIVG -->', _replyWithSticker)
                .replace('BASE64_OF_IMAGE', reply.base64)
            break;
        // NEEDS {buffer, width, height, text}
        case 'image':
        // NEEDS {buffer, width, height, text, time}
        case 'video':
        case 'GIF':
            reply.base64 = reply.buffer.toString('base64')
            let imgWidth = reply.width, imgHeight = reply.height;
            // height proportionate to the width
            let propHeight = (330 / imgWidth) * imgHeight;
            let finalImgHeight = propHeight > 338 ? 338 : propHeight

            switch (reply.type) {
                case 'image':
                    msgBaseCpy = msgBaseCpy.replace('<!-- REPLY_WITH_SIVG -->', _replyWithImage)
                    break;
                case 'video':
                    msgBaseCpy = msgBaseCpy.replace('<!-- REPLY_WITH_SIVG -->', _replyWithVideo)
                        .replace('REPLY_VIDEO_TIME', reply.time)
                    break;
                case 'GIF':
                    msgBaseCpy = msgBaseCpy.replace('<!-- REPLY_WITH_SIVG -->', _replyWithGIF)
                    break;
            }

            msgBaseCpy = msgBaseCpy
                .replace('BASE64_OF_IMAGE', reply.base64)
                .replace('HEIGHT_OF_IMAGE', finalImgHeight)
            if (!!reply.text)
                msgBaseCpy = msgBaseCpy
                    .replace('<!-- TEXT_OF_MESSAGE -->', _videoText)
                    .replace('TEXT_OF_MESSAGE', reply.text)
            break;
        // NEEDS {base64, height, width, text, time}
        case 'ptt':
            reply.base64 = reply.buffer ? reply.buffer.toString('base64') : null

            msgBaseCpy = msgBaseCpy
                .replace('<!-- REPLY_WITH_SIVG -->', _replyWithPtt)
                .replace('REPLY_RECORDING_TIME', reply.time)
                .replace('class="_2AKAp"', 'class="_1w-OG" style="right: 85px;"')

            msgBaseCpy = !!reply.base64 ?
                msgBaseCpy.replace('BASE64_OF_IMAGE', reply.base64) :
                msgBaseCpy.replace('<img src="data:image/jpeg;base64,BASE64_OF_IMAGE" class="_8hzr9 M0JmA i0jNr" style="visibility: visible;">', '')

            break;
        case 'audio':
            // msgBaseCpy = msgBaseCpy
            break;
        case 'document':
            // msgBaseCpy = msgBaseCpy
            break;
    }




    return getSticker(msgBaseCpy)
        .then(buffer => resolve(buffer))
        .catch(err => reject(err))

})

module.exports = {
    text,
    image,
    sticker,
    audio,
    ptt,
    reply
}