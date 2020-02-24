import uuid from 'uuid';
import 'bootstrap/dist/css/bootstrap.min.css';
import './style.css';

const StorageCtrl = (function() {
    return {
        loadItemStorage: function() {
            let items;

            if(localStorage.getItem('items') !== null) {
                items = JSON.parse(localStorage.getItem('items'));
            } else {
                items = [];
            }

            return items;
        },
        addItemStorage: function(item) {
            let items;

            if(localStorage.getItem('items') !== null) {
                items = JSON.parse(localStorage.getItem('items'));
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            } else {
                items = [];
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            }
        },
        deleteItemStorage: function(id) {
            let items = JSON.parse(localStorage.getItem('items'));
            const updateItems = items.filter(item => item.id !== id);
            localStorage.setItem('items', JSON.stringify(updateItems));
        }
    }

})();

const ItemCtrl = (function() {
    // constructor of items instances
    function Item(description, value, type, id) {
        this.description = description;
        this.value = value;
        this.type = type;
        this.id = id;
    }

    const appData = {
        items: StorageCtrl.loadItemStorage(),
        totalIncomes: 0,
        totalExpenses: 0,
        totalBalance: 0
    }

    return {
        getAppData: function() {
            return appData;
        },
        getItems: function() {
            return appData.items;
        },
        addItem: function(data) {
            // generate unique id for every item
            const genID = uuid.v4();
            const { description, value, type } = data;
            // create new instance of item constructor
            const newItem = new Item(description, Number.parseFloat(value), type, genID);
            // add new item to array
            appData.items.push(newItem);

            return newItem;
        },
        removeItem: function(id) {
            const { items } = appData;
            const filterItems = items.filter(item => item.id !== id);
            appData.items = [...filterItems];
        },
        calculateTotalBalance: function() {
            let total;
            const { totalIncomes, totalExpenses } = appData;

            total = totalIncomes - totalExpenses;

            appData.totalBalance = total.toFixed(2);
        },
        calculateTotalIncomes: function() {
            const { items } = appData;

            const arr = [0];
            items.forEach(item => {
                if(item.type === '+') {
                    arr.push(item.value);
                }
            });

            const getSum = arr.reduce((previousValue, currentValue) => previousValue + currentValue);
            appData.totalIncomes = getSum.toFixed(2);
        },
        calculateTotalExpenses: function() {
            const { items } = appData;
            
            const arr = [0];
            items.forEach(item => {
                if(item.type === '-') {
                    arr.push(item.value);
                }
            });

            const getSum = arr.reduce((previousValue, currentValue) => previousValue + currentValue);
            appData.totalExpenses = getSum.toFixed(2);
        },
        getTotalBalance: function() {
            return appData.totalBalance;
        },
        getTotalIncomes: function() {
            return appData.totalIncomes;
        },
        getTotalExpenses: function() {
            return appData.totalExpenses;
        }
    }


})();

const UICtrl = (function() {
    const DOMSelectors = {
        totalBalance: document.querySelector('.total__balance'),
        totalIncomes: document.querySelector('.total__incomes--value'),
        totalExpenses: document.querySelector('.total__expenses--value'),
        itemValueIncome: document.querySelector('.list__value--inc'),
        itemValueExpense: document.querySelector('.list__value--exp'),
        list: document.querySelector('.list-wrapper'),
        itemList: document.querySelector('.list__item'),
        addItemInput: document.querySelector('.add__item'),
        addValueInput: document.querySelector('.add__value'),
        addSelectType: document.querySelector('.add__select'),
        addItemButton: document.querySelector('.add__btn'),
        currentDate: document.querySelector('.current_date'),
        formInputs: document.querySelectorAll('.form-inline')
    };

    return {
        getDOMSelectors: function() {
            return DOMSelectors;
        },
        loadCurrentData: function() {
            const months = ["January","February","March","April","May","June","July",
            "August","September","October","November","December"];
            const date = new Date();
            const month = date.getMonth();
            const year = date.getFullYear();
            // display current date
            DOMSelectors.currentDate.textContent = `${months[month]} ${year}`;
        },
        addInputOutline: function() {
            const { addItemInput, addValueInput, addSelectType, addItemButton } = DOMSelectors;
            const fields = [addItemInput, addValueInput, addSelectType];

            if(addSelectType.value === "+") {
                fields.forEach(field => field.classList.add('blue-outline'));
                addItemButton.classList.add('blue-color');
                fields.forEach(field => field.classList.remove('red-outline'));
                addItemButton.classList.remove('red-color');
            } else {
                fields.forEach(field => field.classList.add('red-outline'));
                addItemButton.classList.add('red-color');
                fields.forEach(field => field.classList.remove('blue-outline'));
                addItemButton.classList.remove('blue-color');
            }
        },
        showItems: function(items) {
            let element,
                typeName,
                typeClass;
            // generate items from array at the moment of init app
            items.forEach(item => {
                item.type === '+' ? typeName = '.list__income' : typeName = '.list__expenses';
                typeName === '.list__income' ? typeClass = 'inc' : typeClass = 'exp';
                element =    `
                    <li id="${item.id}" class="list__item list-group-item">
                        <p class="list__text">${item.description}</p>
                        <div class="list__right">
                        <p class="list__value list__value--${typeClass}">${item.type} ${item.value.toFixed(2)}</p>
                            <div class="list__delete">
                                <button type="button" id="btn-delete" class="list__delete--btn button">
                                    <ion-icon name="close-circle-outline"></ion-icon>
                                </button>
                            </div>
                        </div>
                    </li>
                    `;
                document.querySelector(typeName).insertAdjacentHTML('beforeend', element);
            });
        },
        addSingleItem: function(item) {
            const { description, value, type, id } = item;
            let typeName,
                typeClass;
            // check type of item, and attach to proper list 
            type === '+' ? typeName = '.list__income' : typeName = '.list__expenses';
            // set proper class based on typeName
            typeName === '.list__income' ? typeClass = 'inc' : typeClass = 'exp';
           
            const htmlMarkup = 
                `
                <li id="${id}" class="list__item list-group-item">
                    <p class="list__text">${description}</p>
                    <div class="list__right">
                    <p class="list__value list__value--${typeClass}">${type} ${value.toFixed(2)}</p>
                        <div class="list__delete">
                            <button type="button" id="btn-delete" class="list__delete--btn button">
                                <ion-icon name="close-circle-outline"></ion-icon>
                            </button>
                        </div>
                    </div>
                </li>
                `  ;
            // insert generated element to proper list
            document.querySelector(typeName).insertAdjacentHTML('beforeend', htmlMarkup);
        },
        removeSingleItem: function(item) {
            item.remove();
        },
        showTotalBalance: function(balance) {
            let type = Math.abs(balance).toFixed(2);
            DOMSelectors.totalBalance.innerText = balance >= 0 ? `+ ${type}` : `- ${type}`;
        },
        showTotalIncomes: function(incomes) {
            DOMSelectors.totalIncomes.innerText = `+ ${incomes}`;
        },
        showTotalExpenses: function(expenses) {
            DOMSelectors.totalExpenses.innerText = `- ${expenses}`;
        },
        getInputsValue: function() {
            return {
                description: DOMSelectors.addItemInput.value,
                value: DOMSelectors.addValueInput.value,
                type: DOMSelectors.addSelectType.value
            }
        },
        resetFields: function() {
            DOMSelectors.totalBalance.innerText = '+ 0.00';
            DOMSelectors.totalIncomes.innerText = '+ 0.00';
            DOMSelectors.totalExpenses.innerText = '- 0.00';

        },
        clearInputs: function() {
            DOMSelectors.addValueInput.value = '';
            DOMSelectors.addItemInput.value = '';
            DOMSelectors.addSelectType.value = '+';
        }
    }
})();

const AppCtrl = (function(UICtrl, ItemCtrl) {
    const DOMSelectors = UICtrl.getDOMSelectors();

    const addItem = () => {
        const input = UICtrl.getInputsValue();

        if(input.description !== '' && input.value !== '') {
            const item = ItemCtrl.addItem(input);
            // add item to local storage
            StorageCtrl.addItemStorage(item);
            // add single item to the list
            UICtrl.addSingleItem(item);
            // update balance
            loadCalculates();
            // clear fields after adding item
            UICtrl.clearInputs();
            UICtrl.addInputOutline();
        } else {
            alert('Please fill fields correctly!');
        }
    };

    const deleteItem = (e) => {
        const elementID = e.target.parentElement.id;
        if(elementID === 'btn-delete') {
            const parent = e.target.closest('.list__item');
            // remove item from data
            ItemCtrl.removeItem(parent.id);
            StorageCtrl.deleteItemStorage(parent.id);
            // StorageCtrl.loadItemStorage();
            // remove item from UI
            UICtrl.removeSingleItem(parent);
            // update balance
            loadCalculates();
        }
    };

    const loadEventListeners = () => {
        // add item listener by click
        DOMSelectors.addItemButton.addEventListener('click', () => {
            addItem();
        });
        // add item listener by keypress
        document.addEventListener('keydown', (e) => {
            if(e.keyCode === 13) {
                addItem();
            }
        });
        // delete item listener
        DOMSelectors.list.addEventListener('click', (e) => {
            deleteItem(e);
        });

        DOMSelectors.addSelectType.addEventListener('change', () => {
            UICtrl.addInputOutline();
        });
    };

    const loadCalculates = () => {
        ItemCtrl.calculateTotalIncomes();
        ItemCtrl.calculateTotalExpenses();
        ItemCtrl.calculateTotalBalance();
        // get total balance, incomes and expenses and pass to the UICtrl
        const balance = ItemCtrl.getTotalBalance();
        UICtrl.showTotalBalance(balance);
        // total incomes
        const incomes = ItemCtrl.getTotalIncomes();
        UICtrl.showTotalIncomes(incomes);
        // total expenses
        const expenses = ItemCtrl.getTotalExpenses();
        UICtrl.showTotalExpenses(expenses);
    };

    return {
        init: function() {
            UICtrl.addInputOutline();
            // reset fields and inputs
            UICtrl.resetFields();
            UICtrl.clearInputs();
            // get items from storage
            StorageCtrl.loadItemStorage();
            // load current data
            UICtrl.loadCurrentData();
            // load posts from ItemCtrl and inject them into UICtrl
            const items = ItemCtrl.getItems();
            UICtrl.showItems(items);
            // calculate incomes, expenses and total budget
            loadCalculates();
            // load listeners
            loadEventListeners();
        }
    }
})(UICtrl, ItemCtrl, StorageCtrl);

AppCtrl.init();