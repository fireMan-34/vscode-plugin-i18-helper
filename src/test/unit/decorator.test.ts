import { equal, notEqual } from 'assert';
import { cacheClassDecoratorFactory, cacheMethDecoratorFactory, cacheSetCleanFactory, cacheAccessorCleanFacory } from 'decorators/index';

const NAME_1 = 'fireMan-34', NAME_2 = 'maxuFeng', INIT_VERSION = 1;

describe('装饰器测试', function () {
    it('持久化装饰器方法测试', function () {
        @cacheClassDecoratorFactory
        class User {
            constructor(public name: string,) {
            }
            public age: number = 18;
            @cacheSetCleanFactory<typeof User>([] , 1)
            set version(v: number) {

            }
            @cacheMethDecoratorFactory()
            getUserInfo() {
                return {
                    name: this.name,
                    age: this.name.length,
                };
            };
        };
        const n = 'fireMan-34';
        const n1 = 'maxuFeng';
        const u = new User(n);
        const r = u.getUserInfo();
        equal(r.name, n);
        equal(r.age, n.length);
        u.name = n1;
        const r1 = u.getUserInfo();
        equal(r1.name, n);
        equal(r1.age, n.length);
        u.version = 3;
        const r2 = u.getUserInfo();
        equal(r2.name, n1);
        equal(r2.age, n1.length);
        equal(u.version, 1);
        u.version = 2;
        equal(u.version, 2);
    });
    it('异步持久化测试', function (done) {
        const n = 'fireMan-34', n1 = 'maxuFeng';
        @cacheClassDecoratorFactory
        class User {
            constructor(public name: string,) { }
            @cacheMethDecoratorFactory()
            async getUserInfo(err?: any) {
                if (err) {
                    return Promise.reject(err);
                }
                return {
                    name: this.name,
                    age: this.name.length,
                };
            }
        };
        const u = new User(n);
        u.getUserInfo()
            .then(r => {
                u.name = n1;
                u.getUserInfo()
                    .then(r1 => {
                        equal(r1.name, n);
                        equal(r1.age, n.length);
                        done();
                    })
                    .catch(done);
                equal(r.name, n);
                equal(r.age, n.length);
            }).catch(done);
    });
    it('异步错误持久化测试', function (done) {
        @cacheClassDecoratorFactory
        class User {
            constructor(public name: string,) { }
            @cacheMethDecoratorFactory()
            async getUserInfo(err?: unknown) {
                if (err) {
                    return Promise.reject(err);
                }
                return {
                    name: this.name,
                    age: this.name.length,
                };
            }
        };
        const n1 = "fireMan-34", n2 = "maxuFeng";
        const error = 'error';
        const u = new User(n1);
        u.getUserInfo(error).catch(() => {
            u.getUserInfo()
            .then((r1) => {
                u.getUserInfo()
                .then(r2 => {
                    equal(r1, r2);
                    done();
                })
                .catch(done);
            })
            .catch(done);
        });
        // equal(r2, r3);
    });
    it('存取器装饰器测试', function(){
        const TEST_VERSION = 2;
        @cacheClassDecoratorFactory
        class User{
            constructor(public userName: string = NAME_1) {

            }
            
            @cacheAccessorCleanFacory([])
            accessor version = INIT_VERSION;
            
            @cacheAccessorCleanFacory([])
            accessor testVersion = INIT_VERSION;

            @cacheMethDecoratorFactory()
            getUserInfo(){
                return {
                    name: this.userName,
                    age: this.userName.length,
                };
            }
        }

        const u = new User();
        const r1 = u.getUserInfo();
        u.version = TEST_VERSION;
        const r2 = u.getUserInfo();
        const r3 = u.getUserInfo();
        notEqual(r1, r2);
        equal(r2, r3);
        u.testVersion = TEST_VERSION;
        const r4 = u.getUserInfo();
        notEqual(r3, r4);
    });
});