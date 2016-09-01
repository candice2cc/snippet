/**
 * js patterns template
 * Created by candice on 16/8/31.
 */
;

/**
 * 单例模式有三种方式:在构造函数的静态属性中缓存实例(缺点:可能在外部代码中被修改);将实例包装在闭包中(缺点:带来了额外的闭包开销)
 */

/**
 * 单例模式一:在构造函数的静态属性中缓存实例
 * 缺点:可能在外部代码中被修改
 * @returns {*}
 * @constructor
 */
function Singleton() {
    if (typeof Singleton.instance === 'object') {
        return Singleton.instance;
    }

    //TODO 正常代码

    //缓存
    Singleton.instance = this;

    //隐式返回
    return this;
}

/**
 * 单例模式二:将实例包装在闭包中
 * 缺点:带来了额外的闭包开销
 * @returns {Singleton2}
 * @constructor
 */
function Singleton2() {
    //缓存实例
    var instance = this;


    //重写该构造函数
    Singleton2 = function () {
        return instance;
    };

    //保留原型属性
    Singleton2.prototype = this;

    //实例
    instance = new Singleton2();

    //重置构造函数指针
    instance.constructor = Singleton2;


    // TODO 正常代码
    instance.name = 'Singleton2';


    return instance;

}


//Test
var single = new Singleton();
var single2 = new Singleton();
console.log(single === single2);


var single3 = new Singleton2();
single3.bag = "bag";

var single4 = new Singleton2();
single4.bag = "bag2";

console.log(single3 === single4);
console.log(single3.constructor === Singleton2);


/**
 * 工厂模式
 * @constructor
 */
//父构造函数
function CarMaker() {
}
//父类的方法
CarMaker.prototype.drive = function () {
    return 'Vroom,I have ' + this.doors + ' doors';
};

//静态工厂方法
CarMaker.factory = function (type) {
    var constr = type, newcar;

    //构造函数不存在,则抛出错误
    if (typeof CarMaker[constr] !== 'function') {
        throw{
            name: 'Error',
            message: constr + " doesn't exist"
        };
    }
    //子类的原型继承父类,但仅继承一次
    if (typeof CarMaker[constr].prototype.drive !== 'function') {
        CarMaker[constr].prototype = new CarMaker();
    }

    //创建新的实例
    newcar = new CarMaker[constr]();
    //TODO 此处选择性的执行一些方法

    return newcar;

};
CarMaker.Compact = function () {
    this.doors = 4;
};
CarMaker.Convertible = function () {
    this.doors = 2;
};
CarMaker.SUV = function () {
    this.doors = 24;
};

var compact = CarMaker.factory('Compact');
var convertible = CarMaker.factory('Convertible');
var suv = CarMaker.factory('SUV');
console.log(compact.drive());
console.log(convertible.drive());
console.log(suv.drive());


/**
 * 策略模式:代码的客户端可以使用同一接口来工作,但是策略模式根据上下文,从多个算法中选择用于处理特定任务的算法
 * 例子:表单验证,实现validator
 * @type {{types: {}, messages: Array, config: {}, validate: validator.validate, hasErrors: validator.hasErrors}}
 */
var validator = {
    //所有可用的检查
    types: {},

    //在当前会话中的错误信息
    messages: [],

    //当前验证配置
    config: {},

    //接口,data为键-值对
    validate: function (data) {
        var i, msg, type, checker, result_ok;
        this.messages = [];
        for (i in data) {
            if (data.hasOwnProperty(i)) {
                type = this.config[i];
                checker = this.types[type];

                if (!type) {
                    continue;
                }
                if (!checker) {
                    throw {
                        name: "ValidationError",
                        message: "No handler to validate type " + type
                    };

                }
                result_ok = checker.validate(data[i]);
                if (!result_ok) {
                    msg = "Invalid value for *" + i + "*, " + checker.instructions;
                    this.messages.push(msg);
                }
            }
        }
        return this.hasErrors();
    },

    //帮助程序
    hasErrors: function () {
        return this.messages.length !== 0;
    }

};
//非空值的检查
validator.types.isNotEmpty = {
    validate: function (value) {
        return value !== "";

    },
    instructions: "the value cannot be empty"
};
//检查值是否是一个数字
validator.types.isNumber = {
    validate: function (value) {
        return !isNaN(value);

    },
    instructions: "the value can only be a valid number,e.g.1,3.14 or 2010"
};
//检查该值是否只包含字母和数字
validator.types.isAlphaNum = {
    validate: function (value) {
        return !/[^a-z0-9]/i.test(value);// /[^a-z0-9]/i:是否存在a-z0-9以外的字符; i：ignorCase忽略大小写 m：mutiple允许多行匹配 g：globle进行全局匹配，指匹配到目标串的结尾
    },
    instructions: "the value can only contain characters and numbers,no special symbols"
};


//使用validator
var data = {
    first_name: "Super",
    last_name: "Man",
    age: "unknown",
    username: "o_0"
};
//配置验证器
validator.config = {
    first_name: 'isNotEmpty',
    age: 'isNumber',
    username: 'isAlphaNum'
};
validator.validate(data);
if (validator.hasErrors()) {
    console.log(validator.messages.join("\n"));
}

/**
 * 观察者模式-发布与订阅
 * @type {{subscribers: {any: Array}, subscribe: publisher.subscribe, unsubscribe: publisher.unsubscribe, publish: publisher.publish, visitSubscribers: publisher.visitSubscribers}}
 */
var publisher = {
    subscribers: {
        any: [] //订阅者
    },
    subscribe: function (fn, type) {
        type = type || 'any';
        if (typeof this.subscribers[type] === 'undefined') {
            this.subscribers[type] = [];
        }
        this.subscribers[type].push(fn);

    },
    unsubscribe: function (fn, type) {
        this.visitSubscribers('unsubscribe', fn, type);
    },
    publish: function (publication, type) {
        this.visitSubscribers('publish', publication, type);
    },
    //帮助函数
    visitSubscribers: function (action, arg, type) {
        var pubtype = type || 'any',
            subscribers = this.subscribers[pubtype],
            i,
            max = subscribers.length;
        for (i = 0; i < max; i++) {
            if(action === 'publish'){
                subscribers[i](arg);
            }else{
                if(subscribers[i] === arg){
                    subscribers.slice(i,1);
                }
            }
        }
    }
};
function makePublisher(o) {
    var i ;
    for(i in publisher){
        if(publisher.hasOwnProperty(i) && typeof publisher[i] === 'function'){
            o[i] = publisher[i];
        }
    }
    o.subscribers = {any:[]};
}

var paper = {
    daily:function () {
        this.publish("big news today");
    },
    monthly:function () {
        this.publish("interesting analysis","monthly");
    }
};
makePublisher(paper);
var joe = {
    drinkCoffee:function (paper) {
        console.log('Just read ' + paper);
    },
    sundayPreNap:function (monthly) {
        console.log('About to fall asleep reading this ' + monthly);
    }
};
paper.subscribe(joe.drinkCoffee);
paper.subscribe(joe.sundayPreNap,'monthly');


paper.daily();
paper.monthly();






