if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => console.log('Service Worker зарегистрирован'))
      .catch(error => console.error('Ошибка регистрации Service Worker:', error));
}


const menuElem = document.querySelector('.menu') 
const helloElem = document.querySelector('.hello') 

const menuSpeed = document.querySelectorAll('.speed-menu')
const menuCount = document.querySelector('.count-inp')
const menuAttempt = document.querySelector('.attempt-inp')
const spanatt = document.querySelector('#attempt-span')
const spancount = document.querySelector('#count-span')
const but = document.querySelector('#but')
const again = document.querySelector('#again')

const progress = document.querySelector('.progressbar')
const listUl = document.querySelector('.list-keys')
const infoDiv = document.querySelector('.info-text')
const heartsDiv = document.querySelector('.heart-items')


class StartMenu{
    constructor(domSpeedInp, domCountInp, domAttempt, domSpanAtt, domSpanCount, domBut, domMenu, domHello){
        this.speed = 100
        this.attempt = 3
        this.count = 12
        this.domMenu = domMenu || null
        this.domHello = domHello || null
        this.domSpeedInp = domSpeedInp || null
        this.domCountInp = domCountInp || null
        this.domAttempt = domAttempt || null
        this.domSpanAtt = domSpanAtt || null
        this.domSpanCount = domSpanCount || null
        this.domBut = domBut || null
        this._menuInit()
    }

    _menuInit(){
        if(this.domAttempt && this.domCountInp && this.domSpeedInp && this.domSpeedInp.length !== 0){
            if(this.domSpanAtt && this.domSpanCount){
                this.domSpanAtt.textContent = this.attempt
                this.domSpanCount.textContent = this.count
                this.domAttempt.value = this.attempt
                this.domCountInp.value = this.count
            }
            this.domAttempt.addEventListener('change', (e) => {this._changeAttempt(e)})
            this.domCountInp.addEventListener('change', (e) => {this._changeCount(e)})
            this.domSpeedInp.forEach(elem => {
                elem.addEventListener('change', (e) => {this._changeSpeed(e)})
            })
        }
        if(this.domBut){
            this.domBut.addEventListener('click', () => {
                this._sendForm()
            })
        }
    }

    _changeAttempt(e){
        this.attempt = e.target.value
        if(this.domSpanAtt){
            this.domSpanAtt.textContent = this.attempt
        }
    }
    
    _changeCount(e){
        this.count = e.target.value
        if(this.domSpanCount){
            this.domSpanCount.textContent = this.count
        }
    }
    
    _changeSpeed(e){
        const sp = e.target.value
        switch(sp){
            case 'easy':
                this.speed = 100
                break
            case 'med':
                this.speed = 70
                break
            case 'hard':
                this.speed = 50
                break
            default:
                this.speed = 1000
        }
    }

    _sendForm(){
        const options = {
            count: this.count,
            hearts: this.attempt,
            speed: this.speed
        }
        new KeyTime(options, progress, listUl, infoDiv, heartsDiv, again)
        this._menuRemove()
    }

    _menuRemove(){
        if(this.domMenu && this.domHello){
            this.domMenu.classList.add('hide')
            this.domHello.classList.remove('hide')
        }
    }
}


class RandomKeys {
    constructor(count){
        this.count = count
    }

    _randomNum(){
        return Math.floor(Math.random() * (4 - 1) + 1)
    }

    creatingArray(){
        return Array.from({length: this.count}, () => this._randomNum())
    }
}

class Info{
    constructor(domElem, heartsDiv, errors){
        this.elem = domElem || null
        this.elemHearts = heartsDiv || null
        this.errors = errors
    }

    textPush(text){
        if(this.elem == null) return
        this.elem.textContent = text
    }

    rendHealth(n){
        if(!this.elemHearts) return
        let cross = '<span>&#10006;</span>'
        let heart = '<span>&#10084;</span>'
        let r = this.errors - n
        const a = Array.from({length : this.errors}, (item, index) => {
            if((index + 1) > r) return heart
            return cross
        })
        this.elemHearts.innerHTML = a.join('')
    }
}


class KeyTime {
    constructor(options, domProgress, listKeys, info, hearts, domAgainBut) {
        this.listKeys = listKeys || null
        this.progress = domProgress || null
        this.again = domAgainBut || null
        this.presenceElements = (this.progress !== null && this.progress.tagName === 'PROGRESS' && this.listKeys !== null)
        this.time = 0
        this.maxTime = 100
        this.speedTime = options.speed || 100
        this.interval = null
        this.keys 
        this.position = 0
        this.elems = options.count || 16
        this.errors = options.hearts || 3
        this.over = false
        this.info = new Info(info, hearts, this.errors)
        console.log(options)
        this.startGame()
    }

    startGame(){
        if (!this.presenceElements) return; 
        this._eventKeys()
        this.progress.setAttribute('max', this.maxTime)
        this.progress.setAttribute('value', this.time)
        this.keys = new RandomKeys(this.elems).creatingArray()
        this._listRend()
        this._interval()
        this.info.rendHealth(this.errors)
    }

    _increasingTime() {
        this.time++
        this.progress.setAttribute('value', this.time)
    }

    _interval() {
        this.interval = setInterval(() => {
            this._increasingTime()
            if(this.time === this.maxTime) this._gameOver() 
        }, this.speedTime)
    }

    _listRend(){
        if(!Array.isArray(this.keys)) return
        document.querySelectorAll('.item').forEach(elem => elem.remove())
        this.keys.forEach((elem, ind) => {
            const li = document.createElement('li')
            li.innerHTML = this._whichArrow(elem)
            li.classList.add('item')
            if(ind < this.position) li.classList.add('red-item')
            this.listKeys.append(li)
        })
    } 

    _whichArrow(s){
        switch (s){
            case 1:
                return '&#9668;'
            case 2:
                return '&#9658;'
            case 3:
                return '&#9650;'
            case 4:
                return '&#9660;'
            default :
                return '&#9660;'
        }
    }

    _eventKeys(){
        document.addEventListener('keydown', (e) => {
            if(this.over) return
            this._checkingKey(e.key)
        })
    }

    _sounds(variant){
        const sound = new Audio()
        let fileSound
        switch (variant){
            case 'exactly':
                fileSound = './sound/exactly.mp3'
                break
            case 'mistake':
                fileSound = './sound/mistake.mp3'
                break
            case 'victory':
                fileSound = './sound/victory.mp3'
                break
            case 'over':
                fileSound = './sound/over.mp3'
                break
            default: 
                fileSound = './sound/exactly.mp3'
                break
        }
        sound.src = fileSound
        sound.play()
    }

    _checkingKey(key){
        let elem = this.keys[this.position]
        if(key === this._validator(elem)){
            this._sounds('exactly')
            this.position++
            this._listRend()
            if(this.keys.length === this.position){
                this._victory()
            }
        } else {
            this._sounds('mistake')
            this.errors--
            this.info.rendHealth(this.errors)
        }
        
        if(this.errors === 0) {
            this._gameOver()
        }
    }

    _validator(item){
        switch (item){
            case 1:
                return 'ArrowLeft'
            case 2:
                return 'ArrowRight'
            case 3:
                return 'ArrowUp'
            case 4:
                return 'ArrowDown'
            default :
                return ''
        }
    }

    _gameOver(){
        this._sounds('over')
        this.over = true
        clearInterval(this.interval)
        this.info.textPush('Вы проиграли')
        this.again.classList.remove('hide')
        this.again.addEventListener('click', () => {location.reload()})
    }

    _victory(){
        this._sounds('victory')
        this.over = true
        clearInterval(this.interval)
        this.info.textPush('победа!')
        this.again.classList.remove('hide')
        this.again.addEventListener('click', () => {location.reload()})
    }
}

const menu = new StartMenu(menuSpeed, menuCount, menuAttempt, spanatt, spancount, but, menuElem, helloElem)

