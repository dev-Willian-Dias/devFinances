const Modal = {
    open(){
        document.querySelector('.modal-overlay')
        .classList.add('active')
    },
    close(){
        document.querySelector('.modal-overlay')
        .classList.remove('active')
    },
}

const Storage = {
    get(){
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
        //JSON.parse == transformando String para Array
    },
    set(transactions){
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))//JSON.stringify == transformando o array em String
    }
}

const Transactions = {
    all: Storage.get(),


    add(transaction){
        Transactions.all.push(transaction)

        App.reload()

    },

    remove(index){
        Transactions.all.splice(index, 1)

        App.reload()
    },

    incomes() {
        let income = 0;
        Transactions.all.forEach(transaction => {
            if(transaction.amount > 0){
                income += transaction.amount;            
            }
        })
        return income;
    },
    expense() {
        let expense = 0;
        Transactions.all.forEach(transaction => {
            if(transaction.amount < 0){
                expense += transaction.amount;            
            }
        })
        return expense;
    },
    total() {
        return Transactions.incomes() + Transactions.expense();
    }
}

const DOM = {
    transactionContainer: document.querySelector('.data-table tbody'),


    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML =  DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index

        DOM.transactionContainer.appendChild(tr)

    },


    innerHTMLTransaction(transaction, index){

        const CSSclass = transaction.amount > 0 ? "income" : "expense"

        const amount = Utils.formatCurrency(transaction.amount)

        const html = `
            <td>${transaction.description}</td>
            <td class="${CSSclass}">${amount}</td>
            <td>${transaction.date}</td>
            <td><img onclick="Transactions.remove(${index})" class="minus" src="./assets/minus.svg" alt=""></td>
        `

        return html
    },

    updateBalance(){
        document.getElementById('incomeDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.incomes())

        document.getElementById('expenseDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.expense())

        document.getElementById('totalDisplay')
        .innerHTML = Utils.formatCurrency(Transactions.total())
    },

    clearTransaction(){
        DOM.transactionContainer.innerHTML = ""
    }
   
}

const Utils = {
    formatAmount(value){
        value = Number(value.replace(/\,\./g, "")) * 100
        return value
    },

    formatDate(date){
        const splitDate = date.split("-")
        return `${splitDate[2]}/${splitDate[1]}/${splitDate[0]}`
    },
    
    formatCurrency(value){
        const signal = Number(value) < 0 ?
        "-" : ""

        value = String(value).replace(/\D/g, "")

        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style:"currency",
            currency:"BRL"
        })

        return signal + value
    }
}

const Form = {
    description: document.querySelector('input#descricao'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),

    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value
        }
    },
    
    validateFields(){
        
        const {description, amount, date} = Form.getValues()
        
        if(
            description.trim() === "" ||
            amount.trim() === "" || date.trim() === ""){
                throw new Error('Por favor preencha todos os campos')
            }
    },

    formatValues(){
        let {description, amount, date} = Form.getValues()
        amount = Utils.formatAmount(amount)

        date = Utils.formatDate(date)

        return {
            description,
            amount,
            date
        }
    },

    

    clearFields(){
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },
    

    submit(event){
        event.preventDefault()

        try{
            Form.validateFields()

            const transaction = Form.formatValues()


            Transactions.add(transaction)

            Form.clearFields()

            Modal.close()

        } catch(error) {
            alert(error.message)
        }
        

       

    }
}



const App = {
    init(){
        Transactions.all.forEach((item, index) => {
            DOM.addTransaction(item, index)
        })
        
        DOM.updateBalance()
        
       Storage.set(Transactions.all)
    },
    reload(){
        DOM.clearTransaction()
        App.init()
    },
}

App.init()



