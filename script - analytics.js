/*----------------------------------------------------------------------------------------------------------------------
Особенности по примененным приемам JS см тут: [[Obsidian - dataview - js (dataviewjs)]]


------------------------------------------------------------------------------------------------------------------------
Ручная кастомизация вывода (сортировка, фильтрация, раскрытость)
Возможные значения тут: [[script - analytics - properties]]*/
//----------------------------------------------------------------------------------------------------------------------
// Глобальная переменная: вкл/выкл автотесты (если выключить, то будет чуть быстрее код работать)
// let bool_asserts_activator_flag = false
let bool_asserts_activator_flag = true

// Чекинг времени отработки скрипта: старт
const dttm_script_start = performance.now();



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 1: BASIC FUNCTIONS --------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// В javascript-е всё через жопу походу делается, поэтому приходится вручную базовые функции добавлять...
// С подключением пакетов также проблемы... Мб особенность dataviewjs под виндой, мб мои клешни, хз


/**---------------------------------------------------------------------------------------------------------------------
 * Проверяет, что два объекта или массива равны, и бросает ошибку, если они не равны.
 * 
 * Функция выполняет глубокое сравнение двух объектов или массивов. Если объекты не равны,
 * она выбрасывает ошибку с сообщением, содержащим сравниваемые объекты и необязательный комментарий.
 * 
 * @param {boolean} bool_asserts_activator_flag - Внешняя переменная. Если false - автотесты отключатся
 * 
 * @param {any} obj_input - Входной объект или массив, который нужно проверить.
 * @param {any} obj_expected - Ожидаемый объект или массив для сравнения.
 * @param {string} [str_comment=""] - Необязательный комментарий, который добавляется к сообщению об ошибке.
 * 
 * @throws {Error} Бросает ошибку, если объекты не равны.
 * 
 * @example
 * 
 * // Пример 1: Сравнение одинаковых объектов
 * assertEqual({a: 1}, {a: 1}); // Ничего не происходит, тест пройден
 * 
 * // Пример 2: Сравнение разных объектов
 * assertEqual({a: 1}, {a: 2}, "Объекты должны быть равны"); 
 * // Бросает ошибку: Assertion failed: {"a":1} does not equal {"a":2}\r\nComment: Объекты должны быть равны
 */
function assertEqual(obj_input, obj_expected, str_comment = "") {
    // Пропуск автотестов, если они отключены (для небольшой оптимизации)
    if (!bool_asserts_activator_flag) return true;

    // Функция для глубокого сравнения двух объектов или массивов
    function deepEqual(a, b) {
        if (a === b) return true;

        // Проверка на тип и null
        if (typeof a !== typeof b || a === null || b === null) return false;

        // Проверка на объекты и массивы
        if (typeof a === 'object' && typeof b === 'object') {
            const keysA = Object.keys(a);
            const keysB = Object.keys(b);

            // Сравниваем количество ключей
            if (keysA.length !== keysB.length) return false;

            // Сравниваем порядок и значения ключей
            for (let i = 0; i < keysA.length; i++) {
                const keyA = keysA[i];
                const keyB = keysB[i];

                // Рекурсивно сравниваем каждый ключ
                // Проверка на одинаковость ключей в том же порядке
                if (keyA !== keyB || !deepEqual(a[keyA], b[keyB])) return false;
            }

            return true;
        }

        return false;
    }

    if (!deepEqual(obj_input, obj_expected)) {
        if (str_comment.length > 0) {
            str_comment = `\r\nComment: ${str_comment}`;
        }
        throw new Error(
            `Assertion failed: ${JSON.stringify(obj_input)} does not equal ` + 
            `${JSON.stringify(obj_expected)}${str_comment}`);
    }
}


/**---------------------------------------------------------------------------------------------------------------------
 * Проверяет, что при вызове функции выбрасывается ошибка с ожидаемым сообщением.
 * 
 * Функция вызывает переданную функцию `func` и проверяет, выбрасывает ли она ошибку с сообщением,
 * совпадающим с `expectedMessage`. Если ошибка не выбрасывается или сообщение не совпадает, 
 * функция бросает ошибку.
 * 
 * @param {Function} func - Функция, которая должна выбросить ошибку.
 * @param {string} expectedMessage - Ожидаемое сообщение ошибки.
 * 
 * @throws {Error} Бросает ошибку, если функция не выбрасывает ошибку или сообщение ошибки не совпадает с ожидаемым.
 * 
 * @example
 * 
 * // Пример 1: Проверка правильного выброса ошибки
 * assertError(() => { throw new Error("Test error") }, "Test error"); // Ничего не происходит, тест пройден
 * 
 * // Пример 2: Ошибка не выбрасывается
 * assertError(() => {}, "Test error"); 
 * // Бросает ошибку: Assertion failed: Error was not thrown
 * 
 * // Пример 3: Сообщение ошибки не совпадает
 * assertError(() => { throw new Error("Another error") }, "Test error");
 * // Бросает ошибку: Assertion failed: 'Another error' does not equal 'Test error'
 */
function assertError(func, expectedMessage) {
    // Пропуск автотестов, если они отключены (для небольшой оптимизации)
    if (!bool_asserts_activator_flag) return true;
    
    try {
        func();
        throw new Error('Assertion failed: Error was not thrown');
    } catch (error) {
        if (error.message !== expectedMessage) {
            throw new Error(`Assertion failed: '${error.message}' does not equal '${expectedMessage}'`);
        }
    }
}


/**---------------------------------------------------------------------------------------------------------------------
 * Выполняет функцию и бросает ошибку, если функция выбросила исключение.
 * 
 * Функция выполняет переданную функцию `fn`. Если `fn` выбрасывает исключение, 
 * `assertOk` выбрасывает ошибку с сообщением, содержащим переданное сообщение `message`
 * и сообщение об ошибке из `fn`.
 * 
 * @param {Function} fn      - Функция, которую нужно выполнить.
 * @param {string}   message - Сообщение, которое будет добавлено к ошибке, если `fn` выбросит исключение.
 * 
 * @throws {Error} Бросает ошибку, если `fn` выбрасывает исключение, добавляя `message` к ошибке.
 * 
 * @example
 * 
 * // Пример 1: Проверка выполнения функции без ошибок
 * assertOk(() => { return true; }, "Function should succeed"); // Ничего не происходит, тест пройден
 * 
 * // Пример 2: Функция выбрасывает ошибку
 * assertOk(() => { throw new Error("Inner error") }, "Function should not fail");
 * // Бросает ошибку: Assertion failed: Function should not fail
 * // Error: Inner error
 */
function assertOk(fn, message) {
    // Пропуск автотестов, если они отключены (для небольшой оптимизации)
    if (!bool_asserts_activator_flag) return true;
    
    try {
        fn();
    } catch (error) {
        throw new Error(`Assertion failed: ${message}\nError: ${error.message}`);
    }
}


/**---------------------------------------------------------------------------------------------------------------------
 * Преобразует количество миллисекунд в человекочитаемый формат.
 * 
 * @param {number} ms - Время в миллисекундах. Может быть дробным числом
 * 
 * @returns {string} Человекочитаемая строка, представляющая время в формате:
 *                   "Xd Xh Xm Xs Xms", где X - число соответствующих единиц.
 *                   Если время меньше 1 миллисекунды, вернется "0ms".
 * 
 * @example
 * // Пример 1: Округление и преобразование в часы и миллисекунды
 * normalizeMilliseconds(3600001.5);
 * // Вернет: "1h 1ms"
 * 
 * // Пример 2: Время в миллисекундах менее 1 секунды
 * normalizeMilliseconds(306.7999999523163);
 * // Вернет: "307ms"
 * 
 * // Пример 3: Время, составляющее несколько единиц (например, минуты и секунды)
 * normalizeMilliseconds(61000);
 * // Вернет: "1m 1s"*/
 function normalizeMilliseconds(ms) {
    // Округляем миллисекунды до ближайшего целого числа
    ms = Math.round(ms);

    // Определяем количество миллисекунд в одной секунде, минуте, часе и дне
    const msPerSecond = 1000;
    const msPerMinute = msPerSecond * 60;
    const msPerHour   = msPerMinute * 60;
    const msPerDay    = msPerHour   * 24;

    // Вычисляем количество дней, часов, минут, секунд и оставшихся миллисекунд
    const days    = Math.floor(ms / msPerDay);
    ms %= msPerDay;
    const hours   = Math.floor(ms / msPerHour);
    ms %= msPerHour;
    const minutes = Math.floor(ms / msPerMinute);
    ms %= msPerMinute;
    const seconds = Math.floor(ms / msPerSecond);
    ms %= msPerSecond;

    // Создаем читабельную строку результата
    const readableTime = [
        days    > 0 ? `${days}d` : '',
        hours   > 0 ? `${hours}h` : '',
        minutes > 0 ? `${minutes}m` : '',
        seconds > 0 ? `${seconds}s` : '',
        ms      > 0 ? `${ms}ms` : ''
    ].filter(Boolean).join(' ');

    return readableTime || '0ms';
}


/**---------------------------------------------------------------------------------------------------------------------
 * Возвращает первое значение из переданных аргументов, которое не является null или undefined.
 *
 * @param {...*} values - Переменное количество значений, среди которых нужно найти первое не null и не undefined.
 * 
 * @returns {*} Первое значение, которое не равно null или undefined. 
 *              Если все значения равны null или undefined, вернет null (либо undefined).
 *
 * @example
 * 
 * // Пример 1: Первое значение, не равное null или undefined
 * const result1 = coalesce(null, 1, 2, null, 3); // Вернет 1
 * 
 * // Пример 2: Первое значение из списка - 0
 * const result2 = coalesce(undefined, null, 0, false, "text"); // Вернет 0
 * 
 * // Пример 3: Все значения равны null или undefined
 * const result3 = coalesce(null, undefined, null); // Вернет null
 */
function coalesce(...values) {
    for (let value of values) {
        if (value !== null && value !== undefined) {
            return value;
        }
    }
    return null; // Либо можно вернуть undefined
}

// Примеры использования:
assertEqual(coalesce(null,      1,    2, null,   3),     1,    "[coalesce] тест 1"); // Вернет 1
assertEqual(coalesce(undefined, null, 0, false, "text"), 0,    "[coalesce] тест 2"); // Вернет 0
assertEqual(coalesce(null, undefined, null),             null, "[coalesce] тест 3"); // Вернет null


//----------------------------------------------------------------------------------------------------------------------
// Функция нормализации числа для отрисовки
function numberToStringWithoutZeros(number) {
    if(number == 0) {
        return ""
    } else {
        return number.toString()
    }
}


//------------------------------------------------------------------------------------------------------------------
// Подготовка текста столбца с подсказкой
function frontendColnameWithPopup(str_colname, str_popup) {
    return "<abbr title=\"" + str_popup + "\">" + str_colname + "</abbr>"
}


//----------------------------------------------------------------------------------------------------------------------
// BLOCK 2: STRING FUNCTIONS -------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
/** Класс для работы со строками с использованием регулярных выражений */
function regex(str) {
    class Regex {
        constructor(str) {
            // Инициализация данных
            this.str = str;
        }
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Заменяет все вхождения шаблона регулярного выражения на заданную строку или шаблон.
         * 
         * @param {string} pattern - Шаблон регулярного выражения.
         * @param {string} replacement - Строка замены, где можно использовать `$1`, `$2` и т.д., 
         *                               для ссылок на группы захвата.
         * 
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         */
        replace(pattern, replacement) { 
            const regex = new RegExp(pattern, 'g');
            
            // Локальная функция для обработки замены
            const performReplace = (inputStr) => {
                return inputStr.replace(regex, (...args) => {
                    let result = replacement;
                    for (let i = 1; i < args.length - 2; i++) {
                        result = result.replace(`$${i}`, args[i]);
                    }
                    return result;
                });
            };

            // Если входные данные — массив строк, обрабатываем каждый элемент
            if (Array.isArray(this.str)) {
                this.str = this.str.map(item => performReplace(item));
            } else {
                // Если входные данные — одиночная строка
                this.str = performReplace(this.str);
            }

            return this;
        }
        
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Удаляет все вхождения шаблона регулярного выражения из строки.
         * 
         * @param {string} pattern - Шаблон регулярного выражения для удаления.
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         */
        remove(pattern) { return this.replace(pattern, "") }
        
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Фильтрует массив строк, оставляя только те, которые соответствуют регулярному выражению.
         * 
         * @param {string} pattern - Шаблон регулярного выражения для фильтрации.
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         */
        filter(pattern) {
            const regex = new RegExp(pattern);

            // Локальная функция для проверки и фильтрации
            const performFilter = (inputStr) => {
                return regex.test(inputStr) ? inputStr : null;
            };

            if (Array.isArray(this.str)) {
                // Фильтруем массив, удаляя те элементы, которые не совпадают с шаблоном
                this.str = this.str.filter(item => performFilter(item));
            } else {
                // Если строка не соответствует шаблону, возвращаем пустую строку
                this.str = performFilter(this.str) || '';
            }

            return this;
        }
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Разделяет строку по регулярному выражению на массив подстрок.
         * 
         * @param {string} pattern - Шаблон регулярного выражения для разделения.
         * @param {string} [flags='g'] - Флаги регулярного выражения (по умолчанию глобальный поиск).
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         * @throws {Error} - В случае ошибки создания регулярного выражения.
         */
        split(pattern, flags = 'g') {
            try {
                const regex = new RegExp(pattern, flags);
                const result = [];
                let lastIndex = 0;
                let match;
        
                while ((match = regex.exec(this.str)) !== null) {
                    result.push(this.str.slice(lastIndex, match.index)); // Добавляем часть перед совпадением
                    lastIndex = regex.lastIndex; // Обновляем последний индекс
                }
        
                result.push(this.str.slice(lastIndex)); // Добавляем оставшуюся часть строки
                
                this.str = result
                
                return this;
            } catch (error) {
                throw new Error(`[regex.split] Ошибка создания регулярного выражения: ${error}`);
            }
        }
        
        /**-------------------------------------------------------------------------------------------------------------
         * Извлекает массив значений из строки на основе замены с использованием группы захвата.
         * 
         * @param {string} pattern - Шаблон регулярного выражения с группой захвата.
         * @param {string} [extract='$1'] - Строка замены, где можно использовать `$1`, `$2` и т.д. для групп захвата.
         * @param {string} [flags='g'] - Флаги для регулярного выражения (по умолчанию глобальный поиск).
         * @returns {string[]} - Массив извлеченных значений.
         * @throws {Error} - В случае ошибки создания регулярного выражения.
         */
        extract(pattern, extract = '$1', flags = 'g') {
            try {
                // Создаем регулярное выражение из строки с заданными флагами
                const regex = new RegExp(pattern, flags);
                const results = [];

                // Используем replace для замены и извлечения значений по группе захвата
                this.str.replace(regex, (match, ...groups) => {
                    // Здесь `groups[0]` соответствует первой группе захвата, `groups[1]` второй и т.д.
                    const extracted = extract.replace(/\$(\d+)/g, (_, groupIndex) => groups[groupIndex - 1]);
                    results.push(extracted);
                    // Возвращаем оригинальное совпадение, так как нас интересует только массив результатов
                    return match;
                });
                
                return results;
            } catch (error) {
                throw new Error(`[regex.extract] Ошибка создания регулярного выражения: ${error}`);
            }
        }
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Удаляет пробелы в начале и в конце строки.
         * 
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         */
        trim() {
            this.str = this.str.replace(/^\s+|\s+$/g, '')
                
            return this
        }
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Удаляет из строки все лишние пробелы, оставляя по одному пробелу между словами.
         * 
         * @returns {Regex} - Возвращает текущий объект для цепочки вызовов.
         */
        trimSpaces() {
            this.str = this.str.replace(/\s+/g, ' ')
                
            return this
        }
        
        
        /**-------------------------------------------------------------------------------------------------------------
         * Возвращает экземпляр внутреннего класса `ClassCached`, 
         * который позволяет кэшировать и восстанавливать группы захвата.
         * 
         * @returns {ClassCached} - Экземпляр внутреннего класса `ClassCached`.
         * @throws {Error} - Если исходная строка содержит спецсимволы для кэширования.
         */
        cached() {
            // Внутренний класс
            class ClassCached {
                constructor(classParent) {
                    str = classParent.str
                    this.classParent = classParent // Родительский объект класса Regex
                    
                    this.body = str;         // Текущая строка
                    this.cache = {};         // Кэш для хранения извлеченных подстрок
                    this.extractCounter = 0; // Счетчик для групп замены
                    this.separator_group = '‡'; // Символ для групп замены
                    this.separator_group_match = '✠'; // Разделитель для различных групп в подстроке
                    
                    // Проверка на наличие separator_group и separator_group_match в исходной строке
                    if (str.includes(this.separator_group) || str.includes(this.separator_group_match)) {
                        throw new Error(
                            `[regex.cached] Исходная строка не должна содержать спецсимволы ` + 
                            `"${this.separator_group}" или "${this.separator_group_match}"`);
                    }
                }
            
                
                /**-----------------------------------------------------------------------------------------------------
                 * Извлекает значения на основе шаблона и сохраняет их в кэше.
                 * 
                 * @param {string} pattern - Шаблон регулярного выражения для извлечения.
                 * @returns {ClassCached} - Возвращает текущий объект для цепочки вызовов.
                 */
                extract(pattern) {
                    const regex = new RegExp(pattern.replace(/\\/g, '\\\\'), 'g'); // Экранируем обратные слеши
                    const replacementKey = `${this.separator_group}${++this.extractCounter}`;
                    const matchMap = {};
            
                    let index = 0;
                    this.body = this.body.replace(regex, (match) => {
                        const subKey = `${replacementKey}${this.separator_group_match}${++index}`;
                        matchMap[subKey] = match;
                        return subKey;
                    });
            
                    this.cache[replacementKey] = matchMap;
                    return this; // Возвращаем экземпляр для цепочки вызовов
                }
                
                
                /**-----------------------------------------------------------------------------------------------------
                 * Извлекает строки в кавычках и сохраняет их в кэше. 
                 * Отдельный сложный алгоритм, т.к. сил обычных регулярок не хватает
                 * 
                 * @returns {ClassCached} - Возвращает текущий объект для цепочки вызовов.
                 */
                extractQuotes() {
                    // Сперва функция ищет с начала строки первую любую кавычку `'"
                    // Запоминает текущую кавычку
                    // Дальше берет за группу всё что между этой кавычкой и следующей такой же
                    // вырезает в кэш
                    // повторяет операцию и так до конца строки
                
                    const regex = /(['"`])(?:\\\1|.)*?\1/g; // Регулярное выражение для поиска строк в кавычках
                    const replacementKey = `${this.separator_group}${++this.extractCounter}`;
                    const matchMap = {};
            
                    let index = 0;
                    this.body = this.body.replace(regex, (match) => {
                        const subKey = `${replacementKey}${this.separator_group_match}${++index}`;
                        matchMap[subKey] = match;
                        return subKey;
                    });
            
                    this.cache[replacementKey] = matchMap;
                    return this; // Возвращаем экземпляр для цепочки вызовов
                }
            
                
                /**-----------------------------------------------------------------------------------------------------
                 * Восстанавливает строки из кэша и возвращает родительский объект.
                 * 
                 * @returns {Regex} - Возвращает родительский объект класса Regex.
                 */
                build() {
                    let output = this.body;
            
                    // Восстанавливаем строки из кеша
                    Object.keys(this.cache).reverse().forEach((key) => {
                        const replacements = this.cache[key];
                        Object.keys(replacements).forEach(subKey => {
                            // Экранируем специальные символы
                            const escapedSubKey = subKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); 
                            output = output.replace(new RegExp(escapedSubKey, 'g'), replacements[subKey]);
                        });
                    });
                    
                    this.classParent.str = output
            
                    return this.classParent;
                }
            
                
                /**-----------------------------------------------------------------------------------------------------
                 * Возвращает текущее состояние объекта.
                 * 
                 * @returns {Object} - Объект, содержащий текущую строку (`body`) и кэш.
                 */
                getState() { return {body:  this.body, cache: this.cache }; }
            }
            
            return new ClassCached(this)
        }
    }
    
    return new Regex(str)
}

// extract
assertEqual(
    regex("col = myfunction1(col); otherCol = ['eee', 'eee', 'eee']; col3 = col.map(value => myfunction2(value) + 1)")
        .extract("(^|;)\\s*(\\w+)\\s*=", "$2"),
    ["col", "otherCol", "col3"],
    "[regex.extract] Целевой кейс")

assertEqual(regex("asdt4tmp5atmps3cdtmp3").replace("tmp(\\d+)", "$1wtf").str, "asdt45wtfatmps3cd3wtf", 
    "[regex.replace] Целевой кейс")
    
assertEqual(regex("asdt4tmp5atmps3cdtmp3").replace("(tmp)(\\d+)", "$2wtf").str, "asdt45wtfatmps3cd3wtf",
    "[regex.replace] Целевой кейс - извлечение 2ой группы")
    
assertEqual(
    regex(`col1; col2
        col3
        col4;
        col4; 
        col5; col6
        col7`).replace(';\\s*\r?\n\\s*', '; ').str, 
    `col1; col2
        col3
        col4; col4; col5; col6
        col7`, 
    "[regex.replace] Целевой кейс - удаление переноса каретки (carriage return)")
    
assertEqual(
    regex(
        [
            'col', 
            'col2 = col2.plus(col)', 
            'col_new = regex(‡4✠1).replace(‡4✠2, ‡4✠3).str', 
            'col5 = ‡4✠4', 'col6 = ‡4✠5', 'col7 = ‡4✠6']
        ).replace("^([^ ]+) =.*", "$1").str,
    ["col", "col2", "col_new", "col5", "col6", "col7"],
    "[regex.replace] Проверка отработки метода .replace с массивом"
)

// Проверка метода filter для строки
assertEqual(
    regex('col2 = col2.plus(col)').filter("^col2 =").str, 
    'col2 = col2.plus(col)',
    "[regex.filter] Filter single string (match found)"
);

assertEqual(
    regex('col = col2.plus(col)').filter("^col2 =").str, 
    '',
    "[regex.filter] Filter single string (no match)"
);

// Проверка метода filter для массива
assertEqual(
    regex(
        [
            'col', 
            'col2 = col2.plus(col)', 
            'col_new = regex(‡4✠1).replace(‡4✠2, ‡4✠3).str', 
            'col5 = ‡4✠4', 
            'col6 = ‡4✠5', 
            'col7 = ‡4✠6'])
        .filter("^col2 =")
        .str, 
    ['col2 = col2.plus(col)'],
    "[regex.filter] Filter in array of strings (one match)"
);

assertEqual(
    regex(['col', 'col_new = regex(‡4✠1).replace(‡4✠2, ‡4✠3).str', 'col5 = ‡4✠4', 'col6 = ‡4✠5', 'col7 = ‡4✠6'])
        .filter("^col2 =")
        .str, 
    [],
    "[regex.filter] Filter in array of strings (no match)"
);
    
assertEqual(regex(`
        col; 
        col2 = col2.plus(col)
        col_new = regex('asd\\'sa$d\\'"asd\\\`c\\\`"').replace('asd', '!').str; 
        col5 = 'asd"'; col6 = '"'
        col7 = \`asd\`;
        -otherCol2
    `).trim().str, `col; 
        col2 = col2.plus(col)
        col_new = regex('asd\\'sa$d\\'"asd\\\`c\\\`"').replace('asd', '!').str; 
        col5 = 'asd"'; col6 = '"'
        col7 = \`asd\`;
        -otherCol2`, 
    "[regex.trim] Целевой кейс")

assertEqual(
    regex("one two three").split("\\s").str,
    ["one", "two", "three"],
    "[regex.split] Простое разделение по пробелам"
)

assertEqual(
    regex("a1b2c3").split("\\d").str,
    ["a", "b", "c", ""],
    "[regex.split] Разделение по цифрам"
);

assertEqual(
    regex("hello    world").split("\\s+").str,
    ["hello", "world"],
    "[regex.split] Разделение по нескольким пробелам"
);

assertEqual(
    regex("hello,world!this.is;a:test").split("[,!.;:]").str,
    ["hello", "world", "this", "is", "a", "test"],
    "[regex.split] Разделение по символам пунктуации"
);

assertEqual(
    regex("<div><p>Hello</p><p>World</p></div>").split("<[^>]+>").str,
    ["", "", "Hello", "", "World", "", ""],
    "[regex.split] Разделение строки с HTML тегами"
);

assertError(
    () => regex("hello").split("[").str,
    "[regex.split] Ошибка создания регулярного выражения: SyntaxError: " + 
    "Invalid regular expression: /[/g: Unterminated character class"
);

assertEqual(
    regex("abc.def-ghi_jkl").split("[.\\-_]+").str,
    ["abc", "def", "ghi", "jkl"],
    "[regex.split] Разделение по специальным символам"
);

assertEqual(
    regex("one,two;three four").split("[,;\\s]+").str,
    ["one", "two", "three", "four"],
    "[regex.split] Разделение по нескольким символам (запятая, точка с запятой, пробел)"
);
        
assertError(
    () => regex(`col1; col2 = regexReplace(col3, "[^‡1✠1'3]")`).cached(),
    '[regex.cached] Исходная строка не должна содержать спецсимволы "‡" или "✠"')
    
assertEqual(
    regex(`col1; col2; col3`).cached().extract(`\\"`).extract(`\\'`).extract("\\`").extractQuotes().getState(),
    {
        body:  "col1; col2; col3",
        cache: {
            "‡1": {}, "‡2": {}, "‡3": {}, "‡4": {}}},
    '[regex.cached.extract+extractQuotes] Ненаход любого рода строк (getState)')
    
assertEqual(
    regex(`col1; col2; col3`).cached().extract(`\\"`).extract(`\\'`).extract("\\`").extractQuotes().build().str,
    `col1; col2; col3`,
    '[regex.cached.build] Ненаход любого рода строк. build - отработал успешно')

const str_input = 
    `col1; col2 = regexReplace(col3, "[^\\"'3]"); col3 = 'asd\\'sa$d\\'"asd\\\`c\\\`"'; ` + 
    `col4; col5 = 'asd"'; col6 = '"', col7 = \`asd\``
const class_regex_state = regex(str_input).cached()

assertEqual(
    class_regex_state.extract(`\\"`).getState(),
    {
        body: 
            `col1; col2 = regexReplace(col3, "[^‡1✠1'3]"); col3 = 'asd\\'sa$d\\'"asd\\\`c\\\`"'; ` + 
            `col4; col5 = 'asd"'; col6 = '"', col7 = \`asd\``,
        cache: {"‡1": { "‡1✠1": `\\"`}}},
    "[regex.cached.extract] Замена экранированной \"")

assertEqual(
    class_regex_state.extract(`\\'`).getState(),
    {
        body: 
            `col1; col2 = regexReplace(col3, "[^‡1✠1'3]"); col3 = 'asd‡2✠1sa$d‡2✠2"asd\\\`c\\\`"'; ` + 
            `col4; col5 = 'asd"'; col6 = '"', col7 = \`asd\``,
        cache: { 
            "‡1": { "‡1✠1": `\\"`},
            "‡2": { "‡2✠1": "\\'", "‡2✠2": "\\'" }}},
    "[regex.cached.extract] Замена экранированной '")

assertEqual(
    class_regex_state.extract("\\`").getState(),
    {
        body: 
            `col1; col2 = regexReplace(col3, "[^‡1✠1'3]"); col3 = 'asd‡2✠1sa$d‡2✠2"asd‡3✠1c‡3✠2"'; ` + 
            `col4; col5 = 'asd"'; col6 = '"', col7 = \`asd\``,
        cache: {
            "‡1": { "‡1✠1": `\\"`},
            "‡2": { "‡2✠1": "\\'", "‡2✠2": "\\'" },
            "‡3": { "‡3✠1": "\\`", "‡3✠2": "\\`" }}},
    "[regex.cached.extract] Замена экранированной `")

assertEqual(
    class_regex_state.extractQuotes().getState(),
    {
        body: `col1; col2 = regexReplace(col3, ‡4✠1); col3 = ‡4✠2; col4; col5 = ‡4✠3; col6 = ‡4✠4, col7 = ‡4✠5`,
        cache: {
            "‡1": { "‡1✠1": `\\"`},
            "‡2": { "‡2✠1": "\\'", "‡2✠2": "\\'" },
            "‡3": { "‡3✠1": "\\`", "‡3✠2": "\\`" },
            "‡4": { 
                "‡4✠1": `"[^‡1✠1'3]"`, 
                "‡4✠2": `'asd‡2✠1sa$d‡2✠2"asd‡3✠1c‡3✠2"'`, 
                "‡4✠3": `'asd"'`, 
                "‡4✠4": `'"'`, 
                "‡4✠5": "`asd`" }}},
    "[regex.cached.extractQuotes] Проверка отработки спец. алгоритма по извлечению кавычек")

assertEqual(
    class_regex_state.build().str, 
    str_input,
    "[regex.cached.build] целевой кейс - всё собралось назад")



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 3: ARRAY FUNCTIONS --------------------------------------------------------------------------------------------
/**---------------------------------------------------------------------------------------------------------------------
 * Объединяет элементы массива в одну строку, используя указанный разделитель
 *
 * @param {string} [separator=''] - Разделитель, используемый для соединения элементов массива
 * 
 * @returns {string} Строка, состоящая из элементов массива, разделенных указанным разделителем
 *
 * @example
 * // Пример 1: Объединение с использованием пустого разделителя
 * const arr = [1, 2, 3];
 * const result = arr.paste(); // '123'
 * 
 * // Пример 2: Объединение с использованием пробела в качестве разделителя
 * const result = arr.paste(' '); // '1 2 3'
 * 
 * // Пример 3: Объединение с использованием другого разделителя
 * const result = arr.paste('-'); // '1-2-3'
 */
Array.prototype.paste = function(separator = '') {
    return this.join(separator);
};

// Объединение элементов массива без разделителя
assertEqual(
    ['col', 'col2', 'col_new', 'col5', 'col6', 'col7'].paste(),
    "colcol2col_newcol5col6col7",
    "Paste array without separator"
);

// Объединение элементов массива с разделителем ", "
assertEqual(
    ['col', 'col2', 'col_new', 'col5', 'col6', 'col7'].paste(", "),
    "col, col2, col_new, col5, col6, col7",
    "Paste array with separator"
);

// Объединение элементов массива с разделителем " | "
assertEqual(
    ['col', 'col2', 'col_new', 'col5', 'col6', 'col7'].paste(" | "),
    "col | col2 | col_new | col5 | col6 | col7",
    "Paste array with custom separator"
);


/**---------------------------------------------------------------------------------------------------------------------
 * Метод `plus` для массивов, который позволяет складывать элементы массива с числом или другим массивом.
 * Если передается массив, его элементы складываются с соответствующими элементами исходного массива.
 * Если массивы разной длины, будет выбрасываться ошибка.
 *
 * @param {(number|number[])} value - Число или массив чисел, которые нужно добавить к элементам исходного массива.
 * - Если передается число, оно добавляется ко всем элементам исходного массива.
 * - Если передается массив, его элементы складываются с соответствующими элементами исходного массива.
 *
 * @returns {number[]} Новый массив, содержащий результаты сложения.
 *
 * @throws {Error} Если аргумент не является числом или массивом чисел, или если длины массивов не совпадают.
 */
Array.prototype.plus = function(value) {
    if (Array.isArray(value)) {
        // Если длина массива 1
        if (value.length === 1) {
            // Если `value` является массивом, складываем соответствующие элементы
            return this.map(item => item + value[0])
        }
        
        // Проверка на совпадение длины массивов
        if (value.length !== this.length) {
            throw new Error('[.plus()] The length of the arrays does not match');
        }

        // Если `value` является массивом, складываем соответствующие элементы
        return this.map((item, index) => item + value[index]);
    } else if (typeof value === 'number') {
        // Если `value` является числом, добавляем его к каждому элементу массива
        return this.map(item => item + value);
    } else {
        throw new Error('[.plus()] Argument must be either an array or a number');
    }
}

// Успешные тесты
assertEqual([1, 2, 3].plus([4, 5, 1]), [5, 7, 4], `[.plus()] Сложение массивов`);
assertEqual([1, 2, 3].plus([1]),       [2, 3, 4], `[.plus()] Одиночное число`);
assertEqual([1, 2, 3].plus(1),         [2, 3, 4], `[.plus()] Одинарный вектор`);

// Тесты на ошибку
assertError(() => [1, 2, 3].plus([4, 5]), '[.plus()] The length of the arrays does not match')
assertError(() => [1, 2, 3].plus("not a number or array"), '[.plus()] Argument must be either an array or a number')


/**---------------------------------------------------------------------------------------------------------------------
 * Метод `minus` для массивов, который позволяет вычитать число или другой массив из элементов исходного массива.
 * Если передается массив, его элементы вычитаются из соответствующих элементов исходного массива.
 * Если массивы разной длины, будет выбрасываться ошибка.
 *
 * @param {(number|number[])} value - Число или массив чисел, которые нужно вычесть из элементов исходного массива.
 * - Если передается число, оно вычитается из всех элементов исходного массива.
 * - Если передается массив, его элементы вычитаются из соответствующих элементов исходного массива.
 *
 * @returns {number[]} Новый массив, содержащий результаты вычитания.
 *
 * @throws {Error} Если аргумент не является числом или массивом чисел, или если длины массивов не совпадают.
 */
Array.prototype.minus = function(value) {
    if (Array.isArray(value)) {
        if (value.length === 1) {
            return this.map(item => item - value[0]);
        }

        if (value.length !== this.length) {
            throw new Error('[.minus()] The length of the arrays does not match');
        }

        return this.map((item, index) => item - value[index]);
    } else if (typeof value === 'number') {
        return this.map(item => item - value);
    } else {
        throw new Error('[.minus()] Argument must be either an array or a number');
    }
};

assertEqual([5, 7, 9].minus([4, 5, 6]), [1, 2, 3], `[.minus()] Вычитание массивов`);
assertEqual([5, 7, 9].minus([4]), [1, 3, 5], `[.minus()] Вычитание числа (одинарный вектор)`);
assertEqual([5, 7, 9].minus(4), [1, 3, 5], `[.minus()] Вычитание числа`);
assertError(() => [5, 7, 9].minus([4, 5]), '[.minus()] The length of the arrays does not match');
assertError(() => [5, 7, 9].minus("not a number or array"), '[.minus()] Argument must be either an array or a number');


/**---------------------------------------------------------------------------------------------------------------------
 * Метод `multiply` для массивов, который позволяет умножать элементы массива на число или другой массив.
 * Если передается массив, его элементы умножаются на соответствующие элементы исходного массива.
 * Если массивы разной длины, будет выбрасываться ошибка.
 *
 * @param {(number|number[])} value - Число или массив чисел, которые нужно умножить на элементы исходного массива.
 * - Если передается число, оно умножается на все элементы исходного массива.
 * - Если передается массив, его элементы умножаются на соответствующие элементы исходного массива.
 *
 * @returns {number[]} Новый массив, содержащий результаты умножения.
 *
 * @throws {Error} Если аргумент не является числом или массивом чисел, или если длины массивов не совпадают.
 */
Array.prototype.multiply = function(value) {
    if (Array.isArray(value)) {
        if (value.length === 1) {
            return this.map(item => item * value[0]);
        }

        if (value.length !== this.length) {
            throw new Error('[.multiply()] The length of the arrays does not match');
        }

        return this.map((item, index) => item * value[index]);
    } else if (typeof value === 'number') {
        return this.map(item => item * value);
    } else {
        throw new Error('[.multiply()] Argument must be either an array or a number');
    }
}

assertEqual([1, 2, 3].multiply([4, 5, 1]), [4, 10, 3], `[.multiply()] Умножение массивов`);
assertEqual([1, 2, 3].multiply([2]), [2, 4, 6], `[.multiply()] Умножение числа (одинарный вектор)`);
assertEqual([1, 2, 3].multiply(2), [2, 4, 6], `[.multiply()] Умножение числа`);
assertError(() => [1, 2, 3].multiply([4, 5]), '[.multiply()] The length of the arrays does not match');
assertError(
    () => [1, 2, 3].multiply("not a number or array"), 
    '[.multiply()] Argument must be either an array or a number');


/**---------------------------------------------------------------------------------------------------------------------
 * Метод `divide` для массивов, который позволяет делить элементы массива на число или другой массив.
 * Если передается массив, его элементы делятся на соответствующие элементы исходного массива.
 * Если массивы разной длины, будет выбрасываться ошибка.
 *
 * @param {(number|number[])} value - Число или массив чисел, на которые нужно разделить элементы исходного массива.
 * - Если передается число, оно используется для деления всех элементов исходного массива.
 * - Если передается массив, его элементы используются для деления соответствующих элементов исходного массива.
 *
 * @returns {number[]} Новый массив, содержащий результаты деления.
 *
 * @throws {Error} Если аргумент не является числом или массивом чисел, или если длины массивов не совпадают.
 */
Array.prototype.divide = function(value) {
    if (Array.isArray(value)) {
        if (value.length === 1) {
            return this.map(item => item / value[0]);
        }

        if (value.length !== this.length) {
            throw new Error('[.divide()] The length of the arrays does not match');
        }

        return this.map((item, index) => item / value[index]);
    } else if (typeof value === 'number') {
        return this.map(item => item / value);
    } else {
        throw new Error('[.divide()] Argument must be either an array or a number');
    }
}
    
assertEqual([10, 20, 30].divide([2, 4, 6]), [5, 5, 5], `[.divide()] Деление массивов`);
assertEqual([10, 20, 30].divide([2]), [5, 10, 15], `[.divide()] Деление числа (одинарный вектор)`);
assertEqual([10, 20, 30].divide(2), [5, 10, 15], `[.divide()] Деление числа`);
assertError(() => [10, 20, 30].divide([2, 4]), '[.divide()] The length of the arrays does not match');
assertError(
    () => [10, 20, 30].divide("not a number or array"), 
    '[.divide()] Argument must be either an array or a number');


/**---------------------------------------------------------------------------------------------------------------------
 * Находит максимальное значение в массиве.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {number} - Максимальное значение в массиве.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function max(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    // Предполагаем, что первый элемент массива — максимальный
    let maxValue = array[0];

    for (let i = 1; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        // Для чисел или булевых значений сравниваем текущий элемент с maxValue
        if (array[i] > maxValue) {
            maxValue = array[i];
        }
    }

    return maxValue;
}


/**---------------------------------------------------------------------------------------------------------------------
 * Находит минимальное значение в массиве.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {number} - Минимальное значение в массиве.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function min(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    let minValue = array[0];

    for (let i = 1; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        if (array[i] < minValue) {
            minValue = array[i];
        }
    }

    return minValue;
}


/**---------------------------------------------------------------------------------------------------------------------
 * Находит сумму всех элементов в массиве.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {number} - Сумма всех элементов в массиве.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function sum(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    let total = 0;

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        total += array[i];
    }

    return total;
}


/**---------------------------------------------------------------------------------------------------------------------
 * Находит кумулятивную сумму элементов массива.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {Array<number>} - Массив кумулятивных сумм.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function sumCumulative(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    let cumulativeSum = 0;
    let result = [];

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        cumulativeSum += array[i];
        result.push(cumulativeSum);
    }

    return result;
}


/**
 * Подсчитывает количество элементов, удовлетворяющих заданному условию.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @param {Function} [condition=(x) => true] - Функция условия, возвращающая `true` для элементов, 
 *                                             которые должны быть подсчитаны.
 * 
 * @returns {number} - Количество элементов, удовлетворяющих условию.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function count(array, condition = (x) => true) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    let count = 0;

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        if (condition(array[i])) {
            count++;
        }
    }

    return count;
}


/**---------------------------------------------------------------------------------------------------------------------
 * Находит медиану массива.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {number} - Медиана массива.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function median(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    // Проверка, что массив содержит только числа или булевы значения
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }
    }

    // Преобразование всех булевых значений в числа (true = 1, false = 0)
    const numArray = array.map(x => typeof x === 'boolean' ? +x : x);

    // Сортировка массива по возрастанию
    numArray.sort((a, b) => a - b);

    const middle = Math.floor(numArray.length / 2);

    // Если количество элементов нечетное, возвращаем центральный элемент
    if (numArray.length % 2 !== 0) {
        return numArray[middle];
    } else {
        // Если количество элементов четное, возвращаем среднее значение двух центральных элементов
        return (numArray[middle - 1] + numArray[middle]) / 2;
    }
}


/**---------------------------------------------------------------------------------------------------------------------
 * Находит среднее значение элементов массива.
 * 
 * @param {Array<number|boolean>} array - Массив чисел или булевых значений.
 * @returns {number} - Среднее значение элементов массива.
 * @throws {Error} - Если массив содержит элементы, не являющиеся числами или булевыми значениями.
 */
function avg(array) {
    if (array.length === 0) {
        // throw new Error("Array is empty");
        return 0
    }

    let total = 0;

    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'number' && typeof array[i] !== 'boolean') {
            throw new Error("Array contains non-number and non-boolean elements");
        }

        total += array[i];
    }

    return total / array.length;
}


//----------------------------------------------------------------------------------------------------------------------
// Функция преобразования в массив
// Одиночный объект преобразовывается в массив длины 1
// Нужно для унификации обработки  
function toArray(object) {
    if(!Array.isArray(object)) {
        return [object]
    } else {
        return object
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Merge/combine 2 arrays 
// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
// https://stackoverflow.com/a/38940354 - right (worked obviosly) answer
// https://builtin.com/articles/three-dots-in-javascript
function arrayMerge(arr1, arr2) {
    return [...toArray(arr1), ...toArray(arr2)]
}


//----------------------------------------------------------------------------------------------------------------------
// Deduplicate an array
// https://stackoverflow.com/questions/1584370/how-to-merge-two-arrays-in-javascript-and-de-duplicate-items
// https://stackoverflow.com/a/38940354 - right (worked obviosly) answer
// https://builtin.com/articles/three-dots-in-javascript
function arrayDeduplicate(arr) {
    return [...new Set(toArray(arr))]
}


//----------------------------------------------------------------------------------------------------------------------
// Рекурсивный обход n-уровневого массива в одноуровненый по типу flat 
// Массив [1, [2, [3]]] переводит в [1, 2, 3]
// По идее должен бы работать код "arr.flat(Infinity)" - НО ОН НЕ РАБОТАЕТ БЛЯТЬ
// https://ru.hexlet.io/blog/posts/flat-i-flatmap-novye-metody-dlya-raboty-s-massivami-v-ecmascript
// Почему не работает - не гуглится
function arrayFlat(arr) {
    let arr_result = []
    for (let element of arr) {
        if (Array.isArray(element)) {
            // если элемент является массивом - то разбираем и объединяем его с текущим массивом
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
            arr_result = arr_result.concat(arrayFlat(element));
        } else {
            // Иначе просто добавляем элемент
            arr_result.push(element);
        }
    }
    return arr_result
}


//----------------------------------------------------------------------------------------------------------------------
// Фильтрация массива на основе другого одноразмерного boolean-массива
function arrayFilterByAnotherArrayBool(arr_main, arr_boolean) {
    // https://stackoverflow.com/questions/43275067/filtering-an-array-based-on-another-boolean-array
    return arr_main.filter((x, i) => arr_boolean[i])
}


//----------------------------------------------------------------------------------------------------------------------
// удаление пустот из массива (в первую очередь undefined)
// // Для теста
// print(arrayVoidRemove(["", null, undefined, "123", 345]))
// // 123, 345
function arrayVoidRemove(arr) {
    // https://stackoverflow.com/questions/28607451/removing-undefined-values-from-array
    // + пришлось еще отдельно вручную убрать строки длины 0, т.к. они не удаляются 
    return arr
        .filter(x => x) // снос null, undefined, etc
        // https://stackoverflow.com/questions/44789121/conditional-javascript-filter
        .filter(x => { // снос "" ДЛЯ СТРОК
            if(typeof(x) == "string") {
                return x.length > 0
            } else {
                return true
            }
        })
}


//----------------------------------------------------------------------------------------------------------------------
// Исключение из массива arr_1_from элементов найденных в arr_2_source
function arraysExclude(arr_1_from, arr_2_source) {
    // https://stackoverflow.com/questions/2963281
    // javascript-algorithm-to-find-elements-in-array-that-are-not-in-another-array
    return toArray(arr_1_from).filter(x => !toArray(arr_2_source).includes(x))
}


//----------------------------------------------------------------------------------------------------------------------
// BLOCK 4: TABLE FUNCTIONS --------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Сортировка массива объектов в адекватном sql-формате
// https://stackoverflow.com/questions/2784230/how-do-you-sort-an-array-on-multiple-columns
//
// Пример:
// var arr_of_objects = [
//     {USER:"bob",  SCORE:2000, TIME:32, AGE:16, COUNTRY:"US"},
//     {USER:"jane", SCORE:4000, TIME:35, AGE:16, COUNTRY:"DE"}
// ];
// arr_of_objects.tableSortByKeys({SCORE:"desc", TIME:"asc", AGE:"asc"})
// TODO: удалить после полноценной миграции на таблицы
Array.prototype.tableSortByKeys = function(keys) {
    keys = keys || {};

    // via
    // https://stackoverflow.com/questions/5223/length-of-javascript-object-ie-associative-array
    var obLen = function(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key))
                size++;
        }
        return size;
    };

    // avoiding using Object.keys because I guess did it have IE8 issues?
    // else var obIx = function(obj, ix){ return Object.keys(obj)[ix]; } or
    // whatever
    var obIx = function(obj, ix) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) {
                if (size == ix)
                    return key;
                size++;
            }
        }
        return false;
    };

    var keySort = function(a, b, d) {
        d = d !== null ? d : 1;
        // a = a.toLowerCase(); // this breaks numbers
        // b = b.toLowerCase();
        if (a == b)
            return 0;
        return a > b ? 1 * d : -1 * d;
    };

    var KL = obLen(keys);

    if (!KL)
        return this.sort(keySort);

    for ( var k in keys) {
        // asc unless desc or skip
        keys[k] = 
                keys[k] == 'desc' || keys[k] == -1  ? -1 
              : (keys[k] == 'skip' || keys[k] === 0 ? 0 
              : 1);
    }

    this.sort(function(a, b) {
        var sorted = 0, ix = 0;

        while (sorted === 0 && ix < KL) {
            var k = obIx(keys, ix);
            if (k) {
                var dir = keys[k];
                sorted = keySort(a[k], b[k], dir);
                ix++;
            }
        }
        return sorted;
    });
    
    return this;
};


/**---------------------------------------------------------------------------------------------------------------------
 * Функция проверяет, является ли переданный объект таблицей.
 * Таблицей считается объект, где:
 * - Все значения являются массивами одинаковой длины.
 * - Объект содержит хотя бы один ключ.
 * @param {Object} obj - Объект для проверки.
 * @returns {boolean} Возвращает true, если объект является таблицей, иначе false */
function isTbl(obj) {
    // Проверяем, что переданный аргумент является объектом
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) return false;

    // Получаем все ключи объекта
    const keys = Object.keys(obj);

    // Проверка на пустой объект
    if (keys.length === 0) return false;

    // Получаем длину массива данных первого столбца
    const rowCount = obj[keys[0]].length;

    // Проверяем каждый столбец в объекте
    for (let i = 0; i < keys.length; i++) {
        const col = obj[keys[i]];

        // Проверяем, что каждый столбец является массивом
        if (!Array.isArray(col)) return false;

        // Проверяем, что все столбцы имеют одинаковое количество строк
        if (col.length !== rowCount) return false;
    }

    // Если все проверки пройдены, объект является таблицей
    return true;
}

// Примеры использования
assertEqual(isTbl({ SCORE: [], TIME: [], RATE: [] }), true, "[isTable] пустая таблица");
assertEqual(isTbl({ SCORE: [1, 2, 3], TIME: [2, 3, 5], RATE: ["A", "B", "C"] }), true, "[isTable] целевой кейс");

assertEqual(isTbl({}), false, "[isTable] пустой объект");
assertEqual(isTbl({ SCORE: 1, TIME: [2, 3, 5], RATE: ["A", "B", "C"] }), false, "[isTable] SCORE не массив");
assertEqual(
    isTbl({ SCORE: [1, 2], TIME: [2, 3, 5], RATE: ["A", "B", "C"] }), 
    false, 
    "[isTable] разная длина столбцов");


class Constraints {
    constructor(parentClass) {
        this.parentClass = parentClass;
        this.tableData   = parentClass.data; // ссылка на данные таблицы
        this.cache = {};        // объект для хранения условий
        this.enabled     = true;      // состояние включения/выключения всех условий
    }
    
    getCache() {
        return this.cache
    }
    
    // Вычленение количества ограничений
    count() {
        return sum(Object.values(this.cache).map(x => x.length))
    }
    
    end() {
        this.parentClass.constraints = this
        this.validate()
        return this.parentClass
    }

    // Метод для создания или добавления условия на столбец
    setCondition(column, condition) {
        if (!this.tableData.hasOwnProperty(column)) {
            throw new Error(`Column "${column}" does not exist in the table`);
        }

        // Если уже есть условие для этого столбца, объединяем его с новым
        if (this.cache.hasOwnProperty(column)) {
            this.cache[column].push(condition);
        } else {
            this.cache[column] = [condition];
        }
        
        return this
    }

    // Метод для добавления ограничения NOT NULL
    // для массива не надо реализовывать, иначе запутаешься...
    setNotNull(column) {
        function NotNull(val) {return val !== null && val !== undefined}  
        this.setCondition(column, NotNull)
        return this
    }

    // Метод для добавления ограничения UNIQUE по n столбцам
    setUnique(...columns) {
        
        if (!Array.isArray(columns) || columns.length === 0) {
            throw new Error("Columns must be a non-empty array");
        }
        
        // Проверяем, что все указанные столбцы существуют
        columns.forEach(column => {
            if(typeof column != 'string') {
                throw new Error(
                    `[tbl.constraints.setUnique] Input must be only 'string'. Example: "setUnique('col1', 'col2')"`);
            }
            
            if (!this.tableData.hasOwnProperty(column)) {
                throw new Error(`Column "${column}" does not exist in the table`);
            }
        });
        
        function Unique(table, rowIndex) {
            
            const combinedValues = columns.map(column => table[column][rowIndex]);
            
            for (let i = 0; i < table[columns[0]].length; i++) {
                const values = columns.map(column => table[column][i]);
                
                if (values.join('|') === combinedValues.join('|') && i !== rowIndex) {
                    return i;
                }
            }
            
            return true;
        } 
        
        let column = 'unique_' + columns.join('+')
        // Создаем уникальные условия для комбинаций значений столбцов
        // this.constraints['unique_' + columns.join('+')] = Unique
        
        // Оформлено в виде массива для единообразности отработки при печати
        // Если уже есть условие для этого столбца, объединяем его с новым
        if (this.cache.hasOwnProperty(column)) {
            this.cache[column].push(Unique);
        } else {
            this.cache[column] = [Unique];
        }
        
        // print("test")

        return this;
    }
    
    // Метод для удаления условий по указанным столбцам или всех условий, если столбцы не переданы
    remove(...columns) {
        if (columns.length === 0) {
            // Если столбцы не переданы, удаляем все условия
            this.cache = {};
        } else {
            // Удаляем условия только для указанных столбцов
            columns.forEach(column => {
                if (this.cache.hasOwnProperty(column)) {
                    delete this.cache[column];
                }
            });
        }
        return this;
    }

    // Метод для выключения всех условий
    disable() {
        this.enabled = false;
        return this;
    }

    // Метод для включения всех условий
    enable() {
        this.enabled = true;
        return this;
    }
    
    isEnable() {
        return this.enabled
    }
    
    // Метод для печати текущих ограничений и их состояния
    printString() {
        const arr_cols        = Object.keys(this.cache)
        const arr_cache_count = Object.values(this.cache).map(x => x.length)
        
        const arr_functions   = Object.values(this.cache)
            .map(x => x.map(fn => fn.name == '' ? fn.toString() : fn.name).join("', '"))

        return `` + 
            `Constraints info:\n+ Status: '` + (this.enabled ? "Enabled" : "Disabled") + `'\n+ ` + 
            'cache:\n  + ' + arr_cols.map((col, index) => `'${col}'{${arr_cache_count[index]}}: ` + 
            `['${arr_functions[index]}']`).join(',\n  + ') + ''
    }

    // Метод для печати текущих ограничений и их состояния
    print() {
        print(this.printString())
        return this;
    }

    validate() {
        if (!this.enabled) {
            return this.parentClass;
        }
        
        if(!isTbl(this.tableData)) {
            throw new Error(`[tbl.constraints.validate] Data is not in table format...`)
        }

        Object.entries(this.cache).forEach(([constraintName, condition]) => {
            // Мы допускаем, что здесь есть только уникальные условия
            if (constraintName.startsWith('unique_')) {
                
                const columns = constraintName.substring('unique_'.length).split('+')
                
                const columnIndex = this.tableData[columns[0]].length;

                condition = condition[0]
                
                for (let rowIndex = 0; rowIndex < columnIndex; rowIndex++) {
                    if (condition(this.tableData, rowIndex) != true) {
                        throw new Error(
                            `[tbl.constraints.validate] Row ${rowIndex + 1} and ` + 
                            `${condition(this.tableData, rowIndex) + 1} on columns ` + 
                            `"${columns.join(', ')}" failed 'Unique' constraint`)
                    }
                }
            } else {
                // Применение обычных условий
                Object.entries(this.tableData).forEach(([column, values]) => {
                    if (this.cache.hasOwnProperty(column)) {
                        const columnIndex = values.length;

                        for (let rowIndex = 0; rowIndex < columnIndex; rowIndex++) {
                            const value = values[rowIndex];
                            this.cache[column].forEach(condition => {
                                if (!condition(value, rowIndex)) {
                                    if(condition.name == '') {
                                        condition = condition.toString()
                                    } else {
                                        condition = condition.name
                                    }
                                    
                                    throw new Error(
                                        `[tbl.constraints.validate] Row ${rowIndex + 1} in column ` + 
                                        `"${column}" failed condition: "${condition}"`)
                                }
                            });
                        }
                    }
                });
            }
        });
        
        return this.parentClass;
    }
}

class Join {
    // Конструктор класса Join, инициализирует объект с данными таблицы
    constructor(classParent) {
        this.classParent = classParent
        this.tableData   = classParent.data;
    }

    // Метод для выполнения левого соединения (left join)
    left(table2, cols, if_conflict) {
        if(table2.constructor.name == "TableMethods") {table2 = table2.data}
        this.classParent.data = this.#join(table2, cols, if_conflict, "left")
        return this.classParent.constraints.validate();
    }

    // Метод для выполнения правого соединения (right join)
    right(table2, cols, if_conflict) {
        if(table2.constructor.name == "TableMethods") {table2 = table2.data}
        this.classParent.data = this.#join(table2, cols, if_conflict, "right")
        return this.classParent.constraints.validate();
    }

    // Метод для выполнения внутреннего соединения (inner join)
    inner(table2, cols, if_conflict) {
        // print(table2 === tbl())
        if(table2.constructor.name == "TableMethods") {table2 = table2.data}
        this.classParent.data = this.#join(table2, cols, if_conflict, "inner")
        return this.classParent.constraints.validate();
    }

    // Метод для выполнения полного соединения (full join)
    full(table2, cols, if_conflict) {
        if(table2.constructor.name == "TableMethods") {table2 = table2.data}
        this.classParent.data = this.#join(table2, cols, if_conflict, "full")
        return this.classParent.constraints.validate();
    }
    
    // Метод для выполнения исключения (exclude)
    exclude(table2, cols) {
        if (table2.constructor.name == "TableMethods") { table2 = table2.data }
        this.classParent.data = this.#join(table2, cols, null, "exclude");
        return this.classParent.constraints.validate();
    }

    // Вспомогательный метод для выполнения соединений всех типов
    // Вспомогательный метод для выполнения соединений всех типов
    #join(table2, cols, if_conflict, joinType) {
        let result = {}; // Объект для хранения результатов соединения
        let table1 = this.tableData; // Данные первой таблицы

        // if(cols == 'links') { 
        //     print('Отсечка') 
        //     tbl(this.tableData).print()
        // }
        
        // Получаем имена столбцов первой и второй таблицы
        const keys1 = Object.keys(table1);
        const keys2 = Object.keys(table2);

        // Если одна из таблиц пуста (по столбцам)
        if (keys1.length === 0 && keys2.length === 0) {
            return {}; // Если обе таблицы пусты, возвращаем пустой объект
        } else if (keys1.length === 0) {
            // Если первая таблица пуста
            keys2.forEach(key => {
                result[key] = [...table2[key]]; // Копируем все данные из второй таблицы
            });
            return result;
        } else if (keys2.length === 0) {
            // Если вторая таблица пуста
            keys1.forEach(key => {
                result[key] = [...table1[key]]; // Копируем все данные из первой таблицы
            });
            return result;
        }
        
        
        
        // Проверяем, если первая таблица пуста (по строкам), но имеет столбцы
        const table1IsEmpty = keys1.length > 0 && table1[keys1[0]].length === 0;

        // Проверяем, если вторая таблица пуста (по строкам), но имеет столбцы
        const table2IsEmpty = keys2.length > 0 && table2[keys2[0]].length === 0;
        
        function colsOrder(tbl, arr_cols_to_order) {
            const tbl_output = {};
        
            // Добавляем в новый объект столбцы в указанном порядке
            arr_cols_to_order.forEach(key => {
                if (tbl.hasOwnProperty(key)) {
                    tbl_output[key] = tbl[key];
                }
            });
        
            // Добавляем остальные столбцы, которые не были указаны в sortOrder, в конец
            Object.keys(tbl).forEach(key => {
                if (!tbl_output.hasOwnProperty(key)) {
                    tbl_output[key] = tbl[key];
                }
            });
        
            return tbl_output;
        }
        
        
        
        // Если первая таблица пуста (по строкам) и делается левое соединение
        if (table1IsEmpty && joinType === "left") {
        // if (table1IsEmpty && joinType !== "right") {
            keys2.forEach(key => {
                result[key] = [...table2[key]];
            });

            // Добавляем столбцы из первой таблицы и заполняем их null
            arraysExclude(keys1, keys2).forEach(key => {
                result[key] = Array(table2[keys2[0]].length).fill(null);
            });
            
            result = colsOrder(result, [...keys1, ...arraysExclude(keys2, keys1)])

            return result;
        // Если вторая таблица пуста (по строкам) и делается правое соединение
        } else if (table2IsEmpty && joinType === "right") {
        // } else if (table2IsEmpty && joinType !== "left") {
            keys1.forEach(key => {
                result[key] = [...table1[key]];
            });

            // Добавляем столбцы из второй таблицы и заполняем их null
            arraysExclude(keys2, keys1).forEach(key => {
                result[key] = Array(table1[keys1[0]].length).fill(null);
            });
            
            result = colsOrder(result, [...keys2, ...arraysExclude(keys1, keys2)])

            return result;
        // Если хоть одна таблица пустая и делается inner-слияние - то возвращается пустая таблица
        }  else if ((table1IsEmpty | table2IsEmpty) && joinType === 'inner') {
            keys1.forEach(key => {
                result[key] = [];
            });
            
            // Добавляем столбцы из второй таблицы и заполняем их null
            arraysExclude(keys2, keys1).forEach(key => {
                result[key] = [];
            });
            
            result = colsOrder(result, [...keys2, ...arraysExclude(keys1, keys2)])
            
            return result;
        }
         
        // if(cols == 'links') {
        //     print('Отсечка - ДВА') 
        // }
        
        

        // Инициализация пустых массивов для каждого столбца в результирующей таблице
        keys1.forEach(key => {
            result[key] = [];
        });

        keys2.forEach(key => {
            if (!result.hasOwnProperty(key)) {
                result[key] = [];
            }
        });

        // Определение столбцов, по которым будет происходить соединение
        const joinKeys1 = [];
        const joinKeys2 = [];

        if (typeof cols === 'string') {
            // Если cols - это строка, добавляем её как ключ соединения
            joinKeys1.push(cols);
            joinKeys2.push(cols);
        } else if (Array.isArray(cols)) {
            // Если cols - это массив, обрабатываем его как список ключей
            cols.forEach(col => {
                if (typeof col === 'string') {
                    joinKeys1.push(col);
                    joinKeys2.push(col);
                } else if (typeof col === 'object') {
                    for (let [key1, key2] of Object.entries(col)) {
                        joinKeys1.push(key1);
                        joinKeys2.push(key2);
                    }
                }
            });
        } else if (typeof cols === 'object') {
            // Если cols - это объект, обрабатываем его как пары ключей
            for (let [key1, key2] of Object.entries(cols)) {
                joinKeys1.push(key1);
                joinKeys2.push(key2);
            }
        } else {
            // Выбрасываем ошибку, если тип cols не соответствует ожидаемому
            throw new Error('Invalid column specifier');
        }

        // Проверка наличия всех столбцов для соединения в первой таблице
        joinKeys1.forEach(key => {
            if (!keys1.includes(key)) {
                throw new Error(`Column '${key}' not found in the first table`);
            }
        });

        // Проверка наличия всех столбцов для соединения во второй таблице
        joinKeys2.forEach(key => {
            if (!keys2.includes(key)) {
                throw new Error(`Column '${key}' not found in the second table`);
            }
        });

        // Создание индексов для быстрого поиска
        const index1 = table1[joinKeys1[0]].map((_, i) => i);
        const index2 = table2[joinKeys2[0]].map((_, i) => i);

        // Обработка для метода exclude
        if (joinType === "exclude") {
            for (let i of index1) {
                let shouldExclude = false;

                for (let j of index2) {
                    let joinMatch = true;

                    for (let k = 0; k < joinKeys1.length; k++) {
                        if (table1[joinKeys1[k]][i] !== table2[joinKeys2[k]][j]) {
                            joinMatch = false;
                            break;
                        }
                    }

                    if (joinMatch) {
                        shouldExclude = true;
                        break;
                    }
                }

                if (!shouldExclude) {
                    keys1.forEach(key => {
                        if (!result[key]) result[key] = [];
                        result[key].push(table1[key][i]);
                    });
                }
            }
            
            // Добавляем столбцы из второй таблицы и заполняем их null
            arraysExclude(keys2, keys1).forEach(key => {
                result[key] = Array(result[keys1[0]].length).fill(null);
            });

            return result;
        }
        
        // Обработка строк первой таблицы
        for (let i of index1) {
            let matched = false;

            // Поиск совпадений во второй таблице
            for (let j of index2) {
                let joinMatch = true;

                // Проверка совпадений по всем ключам соединения
                for (let k = 0; k < joinKeys1.length; k++) {
                    if (table1[joinKeys1[k]][i] !== table2[joinKeys2[k]][j]) {
                        joinMatch = false;
                        break;
                    }
                }

                if (joinMatch) {
                    matched = true;

                    // Добавляем данные из первой таблицы в результирующий объект
                    keys1.forEach(key => {
                        result[key].push(table1[key][i]);
                    });

                    // Добавляем данные из второй таблицы, проверяя наличие конфликта
                    keys2.forEach(key => {
                        if (result[key].length === result[keys1[0]].length) {
                            result[key][result[key].length - 1] = if_conflict
                                ? if_conflict(result[key][result[key].length - 1], table2[key][j])
                                : table2[key][j];
                        } else {
                            result[key].push(table2[key][j]);
                        }
                    });
                }
            }

            // Если не найдено совпадений и тип соединения "left" или "full"
            if (!matched && (joinType === "left" || joinType === "full")) {
                // Добавляем данные из первой таблицы
                keys1.forEach(key => {
                    result[key].push(table1[key][i]);
                });

                // Добавляем null для отсутствующих данных из второй таблицы
                arraysExclude(keys2, keys1).forEach(key => {
                    result[key].push(null);
                });
            }
        }

        // Обработка правого соединения и полного соединения
        if (joinType === "right" || joinType === "full") {
            for (let j of index2) {
                let matched = false;

                // Поиск совпадений в первой таблице
                for (let i of index1) {
                    let joinMatch = true;

                    for (let k = 0; k < joinKeys1.length; k++) {
                        if (table1[joinKeys1[k]][i] !== table2[joinKeys2[k]][j]) {
                            joinMatch = false;
                            break;
                        }
                    }

                    if (joinMatch) {
                        matched = true;
                        break;
                    }
                }

                // Если не найдено совпадений и тип соединения "right" или "full"
                if (!matched) {
                    // Добавляем данные из второй таблицы
                    keys2.forEach(key => {
                        result[key].push(table2[key][j]);
                    });

                    // Добавляем null для отсутствующих данных из первой таблицы
                    arraysExclude(keys1, keys2).forEach(key => {
                        result[key].push(null);
                    });
                }
            }
        }

        // Удаление пустых столбцов из результата
        Object.keys(result).forEach(key => {
            if (result[key].length === 0) {
                delete result[key];
            }
        })

        return result;
    }
} 


//----------------------------------------------------------------------------------------------------------------------
// Запихнуть класс как прототип от object неудается
// Утилита для создания таблицы
function tbl(input, ...cols) {
    /**-----------------------------------------------------------------------------------------------------------------
    * Внутренняя функция, которая преобразует массив в объект табличного типа
    * Если переданы дополнительные имена столбцов, создается объект с указанным количеством пустых массивов.
    *
    * @param {Array}  input - Массив данных для преобразования.
    * @param {...string} cols - Имена столбцов для результата.
    * 
    * @returns {Object} Объект, где ключ - имя столбца, а значение - массив элементов.
    * 
    * @throws  {Error} Если входные данные не являются массивом.
    */
    function innerToTbl(input, ...cols) {
        // Если входной объект уже табличного типа - его и оставляем
        if (isTbl(input)) { return input }
        
        if (input.constructor.name == "TableMethods") {return input.data}

        // Преобразование возможно только с массивом
        if (!Array.isArray(input)) { throw new Error("[toTbl] Input is not an array and is not a table") }

        // Если массив пустой и переданы имена столбцов, создаем объект с пустыми массивами для каждого столбца
        if (input.length === 0 && cols.length > 0) {
            const emptyTable = {};
            cols.forEach(col => {
                emptyTable[col] = [];
            });
            return emptyTable;
        }

        // Если имена столбцов не указаны, создаем один столбец с именем по умолчанию
        if (cols.length === 0) {
            cols.push("x");
        }

        // Создаем объект, где каждому столбцу соответствует массив
        const table = {};
        cols.forEach((col, index) => {
            table[col] = (index === 0) ? input : [];
        });

        return table;
    }


    //------------------------------------------------------------------------------------------------------------------
    class TableMethods {
        constructor(input, ...cols) {
            // Инициализация данных
            this.data = innerToTbl(input, ...cols);
            // this.constraints = {};  // Инициализация constraints как пустого объекта
            this.constraints = new Constraints(this); // Создаем объект Constraints при инициализации таблицы
        }
        
        /**
         * 
         * @returns {string[]}
         */
        getColnames() {
            // Возвращаем массив с ключами (именами столбцов) из объекта
            return toArray(Object.keys(this.data))
        }
        
        getValuesArrOfArrs() {
            // Получаем массив ключей (названия столбцов)
            const columns = Object.keys(this.data);

            // Получаем количество строк в таблице
            const rowCount = this.data[columns[0]].length;

            // Формируем массив строк
            const rows = [];
            for (let i = 0; i < rowCount; i++) {
                const row = columns.map(col => this.data[col][i]);
                rows.push(row);
            }

            return rows;
        }
        
        // Параметризованная передача параметров
        print({is_constraints = true} = {}) {
            // https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvmarkdowntableheaders-values
            
            let string_to_print = 
                "> [!link]+ Table\n> \n> " +  
                dv.markdownTable(
                    this.getColnames(),
                    this.getValuesArrOfArrs())
            
            // console.log(this.getColnames())
            // console.log(this.getValuesArrOfArrs())
            
            if(is_constraints && this.constraints.count() > 0) {
                string_to_print = 
                    string_to_print + "> <br>\n>\n>> [!личное-мнение]+ " + 
                    regex(this.constraints.printString()).replace('\n', '\n>> ').str
            }
            
            // console.log(string_to_print)
            
            dv.paragraph(string_to_print)
            
            // Можно продолжить цепочку
            return this
        }
        
        // Количество строк
        count() {
            return Object.values(this.data)[0].length
        }
        
        getCol(identifier) {
            // Если identifier - это число, то предполагаем, что это порядковый номер столбца
            if (typeof identifier === 'number') {
                const keys = Object.keys(this.data);
                if (identifier < 0 || identifier >= keys.length) {
                    throw new Error("Column index is out of bounds");
                }
                return this.data[keys[identifier]];
            }
            // Если identifier - это строка, то предполагаем, что это имя столбца
            else if (typeof identifier === 'string') {
                if (!this.data.hasOwnProperty(identifier)) {
                    throw new Error("Column name does not exist");
                }
                return this.data[identifier];
            } else {
                throw new Error("Invalid identifier type");
            }
        }
        
        orderBy(...dict_condition) {
            if ([...dict_condition].length > 1) {
                const invalidFormatMessage = dict_condition.map(col => `${col}: "ASC"`).join(', ');
                throw new Error(`[tbl.orderBy] Incorrect format. Use '{${invalidFormatMessage}}' or 'DESC'`);
            }
            
            dict_condition = dict_condition[0]
            
            if (Array.isArray(dict_condition)) {
                const invalidFormatMessage = dict_condition.map(col => `${col}: "ASC"`).join(', ');
                throw new Error(`[tbl.orderBy] Incorrect format. Use '{${invalidFormatMessage}}' or 'DESC'`);
            }
            
            // Если аргумент передан как строка или массив строк, выбрасываем ошибку
            if (typeof dict_condition === 'string') {
                throw new Error(`[tbl.orderBy] Incorrect format. Use '{${dict_condition}: "ASC"}' or 'DESC'`);
            }
            
            // Нормализация написаний - переводим в единый UPPERCASE
            Object.entries(dict_condition).forEach(([key, value]) => {
                dict_condition[key] = regex(value).replace('^asc$', 'ASC').replace('^desc$', 'DESC').str;
            })
            
            // Проверка на наличие всех указанных столбцов и корректность сортировки
            for (const [col, direction] of Object.entries(dict_condition)) {
                if (!this.data.hasOwnProperty(col)) {
                    throw new Error(`[tbl.orderBy] Column "${col}" does not exist in the table`);
                }
                if (direction !== "ASC" && direction !== "DESC") {
                    throw new Error(
                        `[tbl.orderBy] Invalid sort direction "${direction}" for column "${col}". Use "ASC" or "DESC"`);
                }
            }
        
            // Получаем индексы элементов, отсортированные по заданным столбцам
            const indices = [...Array(this.data[Object.keys(this.data)[0]].length).keys()];
        
            indices.sort((a, b) => {
                for (const [col, direction] of Object.entries(dict_condition)) {
                    if (this.data[col][a] < this.data[col][b]) {
                        return direction === "ASC" ? -1 : 1;
                    } else if (this.data[col][a] > this.data[col][b]) {
                        return direction === "ASC" ? 1 : -1;
                    }
                }
                return 0;
            });
        
            // Создаем отсортированную таблицу
            const tbl_output = {};
            for (const col in this.data) {
                tbl_output[col] = indices.map(i => this.data[col][i]);
            }
            
            this.data = tbl_output
        
            return this;
        }
        
        deduplicate(...cols) {
            const seen = new Set();
            const tbl_output = {};

            // Инициализация выходной таблицы
            for (let col in this.data) {
                tbl_output[col] = [];
            }
            
            let arr_cols = [...cols]
            if(arr_cols.length == 0) { arr_cols = this.getColnames() }

            // Проходим по каждой строке таблицы
            for (let i = 0; i < this.count(); i++) {
                // Создаем ключ для проверки уникальности строки
                const key = arr_cols.map(col => this.data[col][i]).join('|');

                if (!seen.has(key)) {
                    // Если такая комбинация не встречалась, добавляем строку в уникальные строки
                    seen.add(key);
                    for (let col in this.data) {
                        tbl_output[col].push(this.data[col][i]);
                    }
                }
            }

            // Обновляем данные таблицы уникальными строками
            this.data = tbl_output;

            return this;
        }
        
        where(input) {
            // Если input это положительное целое число
            if (Number.isInteger(input) && input >= 0) {

                // Получаем имена столбцов таблицы
                const keys = Object.keys(this.data);
                
                // Проверяем, что input не выходит за пределы диапазона строк
                if (input > this.data[keys[0]].length) {
                    throw new Error("Row number exceeds the number of rows in the table");
                }

                // Создаем новую таблицу с одной строкой
                const dict_filtered_table = {};
                keys.forEach(key => {
                    // Индекс строки в массиве нумеруется с 0, поэтому вычитаем 1
                    dict_filtered_table[key] = [this.data[key][input - 1]];
                });

                this.data = dict_filtered_table
            
                return this
            } else if(typeof input === "string") {
    
                let str_expr = input
                
                // Кэшированное извлечение из expr-строки кода всех текстовых подстрок
                let class_cached_expr = regex(str_expr)
                    .cached().extract(`\\"`).extract(`\\'`).extract("\\`").extractQuotes()
                
                // Не известно, мб переносы каретки и множественные пробелы внутри строк нужны - 
                // нормализуем только в очищенном коде
                // Замена ключевых слов and и or (их тоже поддерживаем)
                class_cached_expr.body = regex(class_cached_expr.body)
                    .trim() // Очистка от лишних пробелов и переносов кареток по краям
                    .replace(';\\s*\r?\n\\s*', '; ').replace('\\s*\r?\n\\s*', '; ') // промежуточные переносы каретки
                    .trimSpaces() // замена множественных пробелов на одинарные
                    .replace('and', '&&')
                    .replace('or',  '|')
                    .str
                
                // Сбор кешированной строки назад в итоговое выражение
                str_expr = class_cached_expr.build().str
            
                // Основной процессинг
                const arr_columns   = Object.keys(this.data);
                const dbl_row_count = this.data[arr_columns[0]].length;
            
                const dict_filtered_table = {};
            
                // Инициализация таблицы для фильтрованных данных
                arr_columns.forEach(col => dict_filtered_table[col] = []);
            
                for (let i = 0; i < dbl_row_count; i++) {
                    // Формируем текстовое выражение
                    let str_expr_final = '';
                    arr_columns.forEach(col => {
                        str_expr_final += `var ${col} = this.data["${col}"][${i}]; `;
                    });
            
                    // Выполняем выражение и проверяем условие
                    const bool_result = eval(str_expr_final + str_expr);
            
                    // Если условие выполняется, добавляем строку в результат
                    if (bool_result) {
                        arr_columns.forEach(col => {
                            dict_filtered_table[col].push(this.data[col][i]);
                        });
                    }
                }
                
                this.data = dict_filtered_table
            
                return this
            } else {
                throw new Error("[tbl.where] incorrect input type");
            }
        }
        
        select(str_expr_select = "") {
            //----------------------------------------------------------------------------------------------------------
            // Предобработка: Извлечение списка целевых столбцов + подготовка целевого кода

            if(str_expr_select.length == 0) {
                throw new Error(`[tbl.select] Expression is empty - it doesn't make sense`);
            }
            
            // Если таблица пустая - не надо исполнять выражения
            if(this.count() == 0) {
                return this.constraints.validate()
            }
            
            
            // Столбцы таблицы
            const arr_cols_input = Object.keys(this.data);
                
            // Кэшированное извлечение из expr-строки кода всех текстовых подстрок
            let class_cached_expr_select = regex(str_expr_select)
                .cached().extract(`\\"`).extract(`\\'`).extract("\\`").extractQuotes()
                
            // Не известно, мб переносы каретки и множественные пробелы внутри строк нужны - 
            // нормализуем только в очищенном коде
            class_cached_expr_select.body = regex(class_cached_expr_select.body)
                .trim() // Очистка от лишних пробелов и переносов кареток по краям
                // .replace(';\\s*\r?\n\\s*', '; ').replace('\\s*\r?\n\\s*', '; ') // промежуточные переносы каретки
                .replace(';\\s*\r?\n\\s*', '; ') // промежуточные переносы каретки
                .trimSpaces() // замена множественных пробелов на одинарные
                .replace(';\\s*', '; ') // после каждой ; будет пробел
                .str
                
            // Вычленение всех одинарных (одиночно указанных) столбцов с "-" под удаление из таблицы
            let arr_cols_to_remove = regex(class_cached_expr_select.body).extract(`[; ]*-([^ ;]+)\\s*(;|$)`)
            class_cached_expr_select.body = // вырезание из основного кода
                regex(class_cached_expr_select.body).remove(`[; ]*-[^ ;]+\\s*(;|$)`).str
            
            // Вычленение всех указанных в выражении столбцов
            let arr_cols_expr_all = regex(class_cached_expr_select.body)
                .split("; ").replace("^([^ ]+) =.*", "$1").str
            let arr_cols_expr_without_actions = // вычленение всех столбцов указанных без каких-то выражений/действий
                regex(class_cached_expr_select.body).split("; ").filter("^[^ =]+$").str
                
            class_cached_expr_select.body = // Вырезание всех одинарных столбцов (указаны без выражения через =)
                regex(class_cached_expr_select.body).split("; ").filter("^[^=]+=.+$").str.paste("; ")
            
            // Сбор кешированной строки назад в итоговое выражение
            str_expr_select = class_cached_expr_select.build().str
            
            
            //----------------------------------------------------------------------------------------------------------
            // Исполнение выражения и модификация таблицы вычислениями (если запрошены)
            if(str_expr_select.length > 0) {
                // Сохранение текущего контекста столбцов
                const dict_context = this.data;

                // Извлечение финального списка столбцов из выражения
                const arr_cols_expr = regex(str_expr_select).extract("(^|;)\\s*([^ ]+)\\s*=", "$2")
                
                // Формируем столбцы-массивы в виде переменных agg$ для eval-окружения 
                // (для использования агрегатных функций)
                const str_expr_cols_as_vars_declaration_arr = arr_cols_input.map(str_colname => {
                    return `let agg$${str_colname} = dict_context['${str_colname}'];`;
                }).paste(' ');
                
                // Определение списка ВПЕРВЫЕ-создаваемых столбцов
                // print()
                const arr_cols_new = arraysExclude(arr_cols_expr, arr_cols_input)
                
                const str_expr_cols_new_creation = arr_cols_new.map(str_colname => {
                    return `let ${str_colname};`
                }).paste(' ')
                
                // Вычисление количества строк
                const dbl_row_count = this.data[arr_cols_input[0]].length
                
                // Фрейм для выходной таблицы
                let table_output = {};
                
                // Построчный обход таблицы
                for (let x_row_id = 0; x_row_id < dbl_row_count; x_row_id++) {
                    // Формируем столбцы-массивы в виде переменных arr$ для eval-окружения 
                    // (для использования агрегатных функций)
                    const str_expr_cols_as_vars_declaration_row = arr_cols_input.map(str_colname => {
                        return `let ${str_colname} = dict_context['${str_colname}'][${x_row_id}];`;
                    }).paste(' ')
                    
                    // Создаем строку с объявлением переменных и выполнения выражения
                    const str_expr_final = `
                        (function() {
                            // Количество строк таблицы
                            function count() { return ${this.count()} }
                            
                            // Функция возвращает массив от 1 до кол-ва строк (индексация)
                            function rowNumber(n) { return ${x_row_id + 1} }
                                
                            // Инъекция столбцов-массивов (agg$*) в виде переменных в окружение
                            ${str_expr_cols_as_vars_declaration_arr}
                            
                            // Инъекция столбцов-значений из строк в виде переменных в окружение
                            ${str_expr_cols_as_vars_declaration_row}
                            
                            // Объявление новосоздаваемых столбцов
                            ${str_expr_cols_new_creation}
                            
                            // Основное выражение
                            ${str_expr_select}
                            
                            // Возвращаем объект с обновленными значениями столбцов
                            return { ${arr_cols_expr.map(str_colname => `${str_colname}: ${str_colname}`).paste(', ')} }
                        })()
                    `;
                    
                    
                    
                    function insertRow(table, newRow) {
                        // Если таблица пуста, инициализируем её на основе newRow
                        if (Object.keys(table).length === 0) {
                            for (let col in newRow) {
                                if (newRow.hasOwnProperty(col)) {
                                    table[col] = [newRow[col]];
                                }
                            }
                        } else {
                            // Пройтись по каждому столбцу в таблице
                            for (let col in table) {
                                if (table.hasOwnProperty(col)) {
                                    // Если в новом ряду есть значение для этого столбца, добавляем его
                                    if (newRow.hasOwnProperty(col)) {
                                        table[col].push(newRow[col]);
                                    } else {
                                        // Если нет, добавляем null
                                        table[col].push(null);
                                    }
                                }
                            }
                            
                            // Добавляем новые столбцы, которые есть в newRow, но отсутствуют в таблице
                            for (let col in newRow) {
                                if (newRow.hasOwnProperty(col) && !table.hasOwnProperty(col)) {
                                    table[col] = Array(table[Object.keys(table)[0]].length - 1).fill(null);
                                    table[col].push(newRow[col]);
                                }
                            }
                        }
                    
                        return table;
                    }
                    
                    // print("test")
                    
                    // Выполняем выражение и получаем результат
                    let tbl_row_result_expr;
                    try {
                        tbl_row_result_expr = eval(str_expr_final);
                    } catch (e) {
                        print(str_expr_final)
                        throw new Error(`[tbl.select] Failed to evaluate str_expr_select: ${e.message}`);
                    }
                    
                    // print(tbl_row_result_expr)
                    
                    table_output = insertRow(table_output, tbl_row_result_expr)
                }
                
                // Обновляем таблицу на основе новых значений
                arr_cols_expr.forEach(str_colname => {
                    this.data[str_colname] = table_output[str_colname]
                });
            
            }
            
            
            //----------------------------------------------------------------------------------------------------------
            // Удаление столбцов из таблицы
            arr_cols_to_remove.forEach(col => { delete this.data[col]; });
            
            
            //----------------------------------------------------------------------------------------------------------
            // Сортировка столбцов (только если было указание хоть одного одинарного столбца)
            if(arr_cols_expr_without_actions.length > 0) {
                function colsOrder(tbl, arr_cols_to_order) {
                    const tbl_output = {};
                
                    // Добавляем в новый объект столбцы в указанном порядке
                    arr_cols_to_order.forEach(key => {
                        if (tbl.hasOwnProperty(key)) {
                            tbl_output[key] = tbl[key];
                        }
                    });
                
                    // Добавляем остальные столбцы, которые не были указаны в sortOrder, в конец
                    Object.keys(tbl).forEach(key => {
                        if (!tbl_output.hasOwnProperty(key)) {
                            tbl_output[key] = tbl[key];
                        }
                    });
                
                    return tbl_output;
                }
                
                this.data = colsOrder(this.data, arr_cols_expr_all)
            }
            
            
            
            //----------------------------------------------------------------------------------------------------------
            // (если в select было ТОЛЬКО перечисление столбцов) Удаление всех неуказанных столбцов
            if(arr_cols_to_remove.length == 0 & str_expr_select.length == 0) {
                function colsRetain(tbl, arr_cols_to_retain) {
                    const tbl_output = {};
                
                    arr_cols_to_retain.forEach(col => {
                        if (tbl.hasOwnProperty(col)) {
                            tbl_output[col] = tbl[col];
                        }
                    });
                
                    return tbl_output;
                }
                
                this.data = colsRetain(this.data, arr_cols_expr_all)
            }
            
            // Проверка ограничений и возврат
            return this.constraints.validate()
        }
        
        join() {
            return new Join(this);
        }
        
        over() {
            // Внутренний класс
            class TableMethodsOver {
                constructor(classParent) {
                    this.classParent = classParent
                    
                    this.str_expr_where        = null
                    this.str_cols_group_by     = null
                    this.str_cols_partition_by = null
                }
                
                // Метод внутреннего класса
                where(str_expr_where) {
                    // Проверки
                    if(this.str_cols_partition_by != null | this.str_cols_group_by != null) {
                        throw new Error(`[tbl.over.where] over().where() may passed only before partitionBy/groupBy`)}
                    if(str_expr_where.length == 0) {
                        throw new Error(`[tbl.where] Where expression is not specified - it doesn't make sense`)}
                    
                    // Установка значения 
                    this.str_expr_where = str_expr_where
                    return this
                }
                
                partitionBy(...cols) {
                    // Проверки
                    if([...cols].length == 0) {
                        throw new Error(`[tbl.over.partitionBy] Partition columns is not specified - it doesn't make sense`)}
                    let arr_no_exists = arraysExclude([...cols], this.classParent.getColnames())
                    if(arr_no_exists.length != 0) {
                        throw new Error(`[tbl.over.partitionBy] Column(s) '${arr_no_exists.paste("', '")}' does not exist`)}
                    
                    // Установка значения
                    this.str_cols_partition_by = [...cols].paste('; ')
                    return this
                }
                
                groupBy(...cols) {
                    // Проверки
                    if([...cols].length == 0) {
                        throw new Error(`[tbl.groupBy] Grouped columns is not specified - it doesn't make sense`)}
                    let arr_no_exists = arraysExclude([...cols], this.classParent.getColnames())
                    if(arr_no_exists.length != 0) {
                        throw new Error(`[tbl.groupBy] Column(s) '${arr_no_exists.paste("', '")}' does not exist`)}
                    
                    // Установка значения
                    this.str_cols_group_by = [...cols].paste('; ')
                    return this
                }
                
                select(str_expr_select) {
                    // Проверки
                    if(
                        this.str_cols_partition_by == null && 
                        this.str_cols_group_by     == null && 
                        this.str_expr_where        == null
                    ) {
                        throw new Error(
                            `[tbl.over.select] where/partitionBy/groupBy are not specified - it doesn't make sense. ` + 
                            `Use just 'tbl.select' (without '.over()')`)
                    }
                    
                    if(this.str_cols_partition_by != null && this.str_cols_group_by != null) {
                        throw new Error(
                            `[tbl.over.select] 'partitionBy' and 'groupBy' cannot be specified at the same time!`)}
                    
                    
                    // кеширование текущей настройки проверок и отключение
                    const constraints_cache_backup = this.classParent.constraints.cache
                    this.classParent.constraints.disable()
                    
                    
                    // Преднастройки
                    let tbl_output = {}
                    let tbl_backup = {}
                    let arr_colnames_default = this.classParent.getColnames()
                    let tbl_raw = this.classParent.select('$index$ = rowNumber()').data
                    
                    // Вырезание куска where
                    if(this.str_expr_where != null) {
                        tbl_backup = tbl(tbl_raw).join().exclude(tbl(tbl_raw).where(this.str_expr_where), '$index$')
                        tbl_raw    = tbl(tbl_raw).where(this.str_expr_where).data
                        // Если фильтром ничего не найдено - возвращаем исходный объект
                        if(tbl(tbl_raw).count() == 0) {
                            this.classParent.constraints.cache = constraints_cache_backup
                            return this.classParent.select('-$index$')
                        } 
                    }
                    
                    // Обработка партицирования
                    if (this.str_cols_partition_by != null) {
                        let tbl_partitions = tbl(tbl_raw)
                            .select(this.str_cols_partition_by)
                            .deduplicate()
                            .data
                        
                        tbl_output = tbl([], ...arr_colnames_default)
                                
                        for (let i = 1; i < tbl(tbl_partitions).count() + 1; i++) {
                            tbl_output = 
                                tbl(tbl_output).join().full(
                                    tbl(tbl_raw)
                                        .join().inner(
                                            tbl(tbl_partitions).where(i), 
                                    this.str_cols_partition_by.split('; '))
                                .select(str_expr_select), 
                                this.str_cols_partition_by.split('; '))
                        }
                    
                    // Обработка группировки
                    } else if (this.str_cols_group_by != null) {
                        let tbl_groups = tbl(tbl_raw)
                            .select(this.str_cols_group_by)
                            .deduplicate()
                            .data
                        
                        tbl_output = tbl([], ...arr_colnames_default)
                                
                        for (let i = 1; i < tbl(tbl_groups).count() + 1; i++) {
                            // Из сгруппированного окна берется первая строка
                            let tbl_chunk = 
                                tbl(tbl_raw)
                                        .join().inner(
                                            tbl(tbl_groups).where(i), 
                                            this.str_cols_group_by.split('; '))
                                    .select(str_expr_select).where(1)
                            
                            tbl_output = tbl(tbl_output).join().full(tbl_chunk, this.str_cols_group_by.split('; '))
                        }
                    // Если был запрошен только where - применение select-вырежния
                    } else {
                        tbl_output = tbl(tbl_raw).select(str_expr_select)
                    }
                    
                    // Возврат обработанного where-куска в общую таблицу назад + чистка
                    if(this.str_expr_where != null) {
                        tbl_output = tbl(tbl_output).join().full(tbl_backup, "$index$")}
                        
                    tbl(tbl_output).orderBy({$index$: "ASC"}).select('-$index$')
                    
                    // Возврат настроек ограничений, проверка и возврат
                    tbl_output.constraints.cache = constraints_cache_backup
                    return tbl_output.constraints.validate()
                }
            }
            
            // Создание дочернего подкласса
            let tableMethodsOver = new TableMethodsOver(this)
            
            return tableMethodsOver
        }

    }
    
    //------------------------------------------------------------------------------------------------------------------
    if(input.constructor.name == "TableMethods") {
        return input
    } else {
        return new TableMethods(input, ...cols)
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Пример пользовательских функций
function testOnValue(value)  { return value + 3 }

assertEqual(tbl([1, 2, 3]).data, {x: [1, 2, 3]}, `[tbl] Проверка автоотработки функции toTbl на векторе`)

// Примеры использования
assertEqual(
    tbl([1, 2, 3]).data, 
    { x: [1, 2, 3] }, 
    "[tbl][Создание/приемка таблицы] Целевой кейс: со именем столбца по умолчанию");

assertEqual(
    tbl({ x: [1, 2, 3] }).data,
    { x: [1, 2, 3] },
    "[tbl][Создание/приемка таблицы] Подаваемый объект уже является таблицей - она и вернулась")
    
assertEqual(
    tbl(['a', 'b', 'c'], "wtf").data, 
    { wtf: ['a', 'b', 'c'] }, 
    "[tbl][Создание/приемка таблицы] Целевой кейс: с указанным именем столбца");
    
assertEqual(
    tbl([], "col1", "col2").data,
    {col1: [], col2: []},
    "[tbl][Создание/приемка таблицы] Создание пустой таблицы с несколькими столбцами")

assertEqual(
    tbl({
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c'],
        col3: [11, 12, 13]}).getColnames(), 
    ["col1", "col2", "col3"], 
    "[tbl.getColnames] Извлечение списка столбцов")

assertEqual(
    tbl({
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c'],
        col3: [11, 12, 13]}).getValuesArrOfArrs(), 
    [
        [1, 'a', 11 ], 
        [2, 'b', 12], 
        [3, 'c', 13]],
    "[tbl.getValuesArrOfArrs] Извлечение списка значений в виде массив массивов")

assertEqual(
    tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select(`
        test = testOnValue(
            testOnValue(testOnValue(col)) + 
            testOnValue(testOnValue(col)))`).data,
    {col: [2,4,5], otherCol: ["a","b","c"], test: [19,23,25]},
    "[tbl.select] Перенос каретки в рамках кода апдейта одного столбца всё-таки отработал")
    
assertError(
    () => tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select().data,
    "[tbl.select] Expression is empty - it doesn't make sense")
    
assertEqual(
    tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select("col = testOnValue(col)").data, 
    {
        col:      [5, 7, 8], 
        otherCol: ['a', 'b', 'c'] },
    "[tbl.select] Апдейт внешней созданной функцией")

let test_col1 = [1]
assertEqual(
    tbl({
        test_col1: [2, 4, 5], 
        otherCol:  ['a', 'b', 'c'] }).select("test_col1 = testOnValue(test_col1)").data, 
    {
        test_col1: [5, 7, 8], 
        otherCol:  ['a', 'b', 'c'] },
    "[tbl.select] Проверка отсутствия проблем при работе в окружении с переменной уже созданой в верхнем окружении")

assertEqual(
    tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select("col = max(agg$col.map(value => value * 2))").data, 
    {
        col:      [10, 10, 10], 
        otherCol: ['a', 'b', 'c'] },
    "[tbl.select] Пример с методом массива + проверка наличия agg$* + " + 
    "Апдейт существующего столбца выражением и внешней созданной функцией (снаружи)")

assertEqual(
    tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select(`col = col + 1; otherCol = "eee"`).data, 
    {
        col:      [3, 5, 6], 
        otherCol: ["eee", "eee", "eee"] }, 
    "[tbl.select] Апдейт 2-ух существующих столбцов одновременно + отработка оператора +")
    
assertEqual(
    tbl({
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'] }).select(`col_new = col - 2`).data, 
    {
        col:      [2, 4, 5], 
        otherCol: ['a', 'b', 'c'],
        col_new:  [0, 2, 3] },
    "[tbl.select] Создание нового столбца")

assertEqual(
    tbl({
        col:      [4, 8, 10], 
        otherCol: ['a', 'b', 'c'],
        col_dbl:  [2, 4, 5] }).select("col_new = col + col_dbl").data, 
    {
        col:      [4, 8, 10], 
        otherCol: ['a', 'b', 'c'],
        col_dbl:  [2, 4,  5],
        col_new:  [6, 12, 15] },
    "[tbl.select] Сложение двух столбцов в новый третий")

assertEqual(
    tbl({
        col1: [4, 3, 11],
        col2: ['a', 'b', 'c'],
        col3: [11, 12, 13]}).select(`index = rowNumber(); dbl_count_rows = count()`).data, 
    {
        col1:           [4, 3, 11],
        col2:           ['a', 'b', 'c'],
        col3:           [11, 12, 13],
        index:          [1, 2, 3],
        dbl_count_rows: [3, 3, 3]},
    "[tbl.select(rowNumber+count)] Добавлен столбец-индекс + столбец с количеством строк таблицы")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`
            col; 
            col2 = col2 + col;
            col_new = regex('asd\\' = sa$d\\'"asd\\\`c\\\`"').replace('asd', '!').str; 
            col5 = 'asd"'; col6 = '"'; col_add;
            col7 = \`asd\`;
            -otherCol2`).data, 
    {
        col:       [4, 8, 10],
        col2:      [8, 12, 14], // просуммировалось
        col_new:   ["!' = sa$d'\"!`c`\"", "!' = sa$d'\"!`c`\"", "!' = sa$d'\"!`c`\""],
        col5:      ['asd"', 'asd"', 'asd"'],
        col6:      ['"', '"', '"'],
        col_add:   [9, 17, 21],
        col7:      ['asd', 'asd', 'asd'],
        otherCol:  ["eee", "as", "r"],
        col3:      [5, 5, 5], 
        otherCol3: ["d", "d", "d"]}, 
    "[tbl.select] Комплексный тест: удаление, сортировка, строковое выражение, мешанина переносов кареток с ';' и т.д.")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`col; col3`).data,
    {
        col:  [4, 8, 10],
        col3: [5, 5, 5] },
    "[tbl.select] Запрошены одинарные столбцы и остались только они")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`col3; col`).data,
    {
        col3: [5, 5, 5],
        col:  [4, 8, 10]},
    "[tbl.select] Запрошены одинарные столбцы и остались только они (в указанной сортировке)")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`-col3; -col`).data,
    {
        otherCol:  ["eee", "as", "r"],
        col_add:   [9, 17, 21],
        col2:      [4, 4, 4], 
        otherCol2: ["c", "c", "c"],
        otherCol3: ["d", "d", "d"] },
    "[tbl.select] Удаление столбцов")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`col3; -col2`).data,
    {
        col3:      [5, 5, 5], 
        col:       [4, 8, 10],
        otherCol:  ["eee", "as", "r"],
        col_add:   [9, 17, 21],
        otherCol2: ["c", "c", "c"],
        otherCol3: ["d", "d", "d"] },
    "[tbl.select] col2 удален, col3 установлен в самое начало слева")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`col0 = 1; col3`).data,
    {
        col0:      [1, 1, 1],
        col3:      [5, 5, 5], 
        col:       [4, 8, 10],
        otherCol:  ["eee", "as", "r"],
        col_add:   [9, 17, 21],
        col2:      [4, 4, 4],
        otherCol2: ["c", "c", "c"],
        otherCol3: ["d", "d", "d"] },
    "[tbl.select] col2 удален, col3 установлен в самое начало слева")

assertEqual(
    tbl(
        {
            col:       [4, 8, 10],
            otherCol:  ["eee", "as", "r"],
            col_add:   [9, 17, 21],
            col2:      [4, 4, 4], 
            col3:      [5, 5, 5], 
            otherCol2: ["c", "c", "c"],
            otherCol3: ["d", "d", "d"] }
        ).select(`-col3; col0 = col3; `).data,
    {
        col:       [4, 8, 10],
        otherCol:  ["eee", "as", "r"],
        col_add:   [9, 17, 21],
        col2:      [4, 4, 4],
        otherCol2: ["c", "c", "c"],
        otherCol3: ["d", "d", "d"],
        col0:      [5, 5, 5] },
    "[tbl.select] справа создан столбец col0, col3 удален (после обсчета выражения) + в конце добавлен '; '")

const table = {
    col1: [4, 8, 10, 3, 1, 1],
    col2: [8, 12, 14, 5, 2, 3],
    col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"']};

assertEqual(
    tbl(table).orderBy({ col1: "ASC" }).data,
    {
        col1: [1, 1, 3, 4, 8, 10],
        col2: [2, 3, 5, 8, 12, 14],
        col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"']},
    "[tbl.orderBy] Test 1: Sort by col1 ascending");

assertEqual(
    tbl(table).orderBy({ col2: "DESC" }).data,
    {
        col1: [10, 8, 4, 3, 1, 1],
        col2: [14, 12, 8, 5, 3, 2],
        col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"']},
    "[tbl.orderBy] Test 2: Sort by col2 descending");

assertEqual(
    tbl(table).orderBy({ col1: "ASC", col2: "DESC" }).data,
    {
        col1: [1, 1, 3, 4, 8, 10],
        col2: [3, 2, 5, 8, 12, 14],
        col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"']},
    "[tbl.orderBy] Test 3: Sort by col1 ascending, col2 descending");

assertError(
    () => tbl(table).orderBy({ col3: "ASC" }).data,
    `[tbl.orderBy] Column "col3" does not exist in the table`)

// Test 5: Invalid sort direction
assertError(
    () => tbl(table).orderBy({ col1: "ASCENDING" }).data,
    `[tbl.orderBy] Invalid sort direction "ASCENDING" for column "col1". Use "ASC" or "DESC"`)

assertError(
    () => tbl(table).orderBy("col1"),
    `[tbl.orderBy] Incorrect format. Use '{col1: "ASC"}' or 'DESC'`);

assertError(
    () => tbl(table).orderBy("col1", "col2"),
    `[tbl.orderBy] Incorrect format. Use '{col1: "ASC", col2: "ASC"}' or 'DESC'`);

assertError(
    () => tbl(table).orderBy(["col1", "col2"]),
    `[tbl.orderBy] Incorrect format. Use '{col1: "ASC", col2: "ASC"}' or 'DESC'`);
    
const table2 = {
    col1: [1, 1, 3, 4, 8, 10],
    col2: [2, 3, 5, 8, 12, 14],
    col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'wtf"']
}

assertEqual(
    tbl(table2).where('col1 > 1 & col1 < 4').data,
    {
        col1: [3],
        col2: [5],
        col5: ['asd"']},
    "[tbl.where] Test 1: col1 > 1 & col1 < 4")

assertEqual(
    tbl(table2).where('col5 == "wtf\\""').data,
    {
        col1: [10],
        col2: [14],
        col5: ['wtf"']},
    "[tbl.where] Test 2: col5 == \"wtf\"\"")

assertEqual(
    tbl(table2).where('(col1 > 1 & col1 < 4) | col5 == "wtf\\""').data,
    {
        col1: [3, 10],
        col2: [5, 14],
        col5: ['asd"', 'wtf"']},
    "[tbl.where] Test 3: (col1 > 1 & col1 < 4) | col5 == \"wtf\"\"")

assertEqual(
    tbl(table2).where('col2 == 8').data,
    {
        col1: [4],
        col2: [8],
        col5: ['asd"']},
    "[tbl.where] Test 4: col2 == 8")

assertEqual(
    tbl(table2).where('col1 == 1').data,
    {
        col1: [1, 1],
        col2: [2, 3],
        col5: ['asd"', 'asd"']},
    "[tbl.where] Test 5: col1 == 1")

assertEqual(
    tbl(table2).where('(col1 > 1 and col1 < 4) or col5 == "wtf\\""').data,
    {
        col1: [3, 10],
        col2: [5, 14],
        col5: ['asd"', 'wtf"']},
    "[tbl.where] Test 6: (col1 > 1 and col1 < 4) or col5 == \"wtf\"\"")

assertEqual(
    tbl(
        {
            col1: [4, 8, 10, 3, 1, 1],
            col2: [8, 12, 14, 5, 2, 3],
            col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"']}
        ).select(`col3 = col1 + max(agg$col2)`).data,
    {
        col1: [4, 8, 10, 3, 1, 1],
        col2: [8, 12, 14, 5, 2, 3],
        col5: ['asd"', 'asd"', 'asd"', 'asd"', 'asd"', 'asd"'],
        col3: [18, 22, 24, 17, 15, 15]},
    "[tblTest.select] Тестирование отработки оператора + и агрегатной функции на arr$* столбце");

assertEqual(
    tbl(
        {
            col1: [1, 2, 3, 1, 2],
            col2: ['a', 'b', 'c', 'a', 'd'],
            col3: [11, 12, 13, 11, 14]
        }).deduplicate('col1').data,
    {
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c'],
        col3: [11, 12, 13]},
    "[tbl.deduplicate] Проверка отработки дедубликации по одному столбцу")
    
assertEqual(
    tbl(
        {
            col1: [1, 2, 3, 1, 2],
            col2: ['a', 'b', 'c', 'a', 'd'],
            col3: [11, 12, 13, 11, 14]
        }).deduplicate('col1', 'col2').data,
    {
        col1: [1, 2, 3, 2],
        col2: ['a', 'b', 'c', 'd'],
        col3: [11, 12, 13, 14]},
    "[tbl.deduplicate] Проверка отработки дедубликации по двум столбцам")

assertEqual(
    tbl({
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c']
    }).constraints.setCondition('col1', val => val > 0).end().select("col1; col2").data,
    {
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c']},
    "[tbl.constraints.setCondition] Set condition one on column 'col1' + отработка select после .end()")

assertEqual(
    tbl({
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c']
    }).constraints.setCondition('col1', val => val > 0).setNotNull("col1").end().data,
    {
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c']},
    "[Constraints.setCondition] Set n conditions on column 'col1'")

assertError(
    () => tbl(
        {
            col1: [-1, 2, 3],
            col2: ['a', 'b', 'c']
        }).constraints.setCondition('col1', x => x > 0).setNotNull("col1").end().data,
    `[tbl.constraints.validate] Row 1 in column "col1" failed condition: "x => x > 0"`)
    
assertError(
    () => tbl(
        {
            col1: [1, null, 3],
            col2: ['a', 'b', 'c']
        }).constraints.setCondition('col1', x => x <= 10).setNotNull("col1").end().data,
    `[tbl.constraints.validate] Row 2 in column "col1" failed condition: "NotNull"`)
    
assertError(
    () => 
        tbl({
                col1: [1, 2, 3],
                col2: ['a', null, 'c']}
        ).constraints.setCondition('col1', x => x <= 10).setNotNull("col1").setNotNull("col2").end().data,
    `[tbl.constraints.validate] Row 2 in column "col2" failed condition: "NotNull"`)

assertError(
    () => 
        tbl({
            col1: [1, 2, 3, 4, 3],
            col2: ['a', 'c', 'b', 'b', 'b']}
        ).constraints.setNotNull("col1").setUnique('col1', 'col2').end().data,
    `[tbl.constraints.validate] Row 3 and 5 on columns "col1, col2" failed 'Unique' constraint`);

assertEqual(
    tbl(
        {
            col1: [1, 2, 3, 4, 3],
            col2: ['a', 'c', 'b', 'b', 'b']}
        ).constraints.setNotNull("col1").setUnique('col1', 'col2').disable().end().data,
    {
        col1: [1, 2, 3, 4, 3],
        col2: ['a', 'c', 'b', 'b', 'b']},
    `[tbl.constraints.validate] Disabled constraint - succeeded`)

assertError(
    () => 
        tbl({
            col1: [1, 2, 3, 4, 3],
            col2: ['a', 'c', 'b', 'b', 'b']}
        ).constraints.setNotNull("col1").setUnique(['col1', 'col2']).disable().end().constraints.enable().end().data,
    `[tbl.constraints.setUnique] Input must be only 'string'. Example: "setUnique('col1', 'col2')"`);

assertError(
    () => 
        tbl({
            col1: [1, 2, 3, 4, 3],
            col2: ['a', 'c', 'b', 'b', 'b']}
        ).constraints.setNotNull("col1").setUnique('col1', 'col2').disable().end().constraints.enable().end().data,
    `[tbl.constraints.validate] Row 3 and 5 on columns "col1, col2" failed 'Unique' constraint`);
    
const test_join_table_1 = {
    id:   [1, 2, 3],
    name: ['Alice', 'Bob', 'Charlie']};

const test_join_table_2 = {
    id:  [2, 3, 4],
    age: [30, 25, 22]};

assertEqual(
    tbl(test_join_table_1).join().left(test_join_table_2, 'id').data,
    {
        id:   [1, 2, 3],
        name: ['Alice', 'Bob', 'Charlie'],
        age:  [null, 30, 25]},
    "[tbl.join.left] Test 1: Left Join with matching column names")

assertEqual(
    tbl(test_join_table_1).join().left(test_join_table_2, { id: 'id' }).data,
    {
        id: [1, 2, 3],
        name: ['Alice', 'Bob', 'Charlie'],
        age: [null, 30, 25]
    },
    "[tbl.join.left] Test 2: Left Join with column mapping")

assertEqual(
    tbl(test_join_table_1).join().left(test_join_table_2, ['id']).data,
    {
        id: [1, 2, 3],
        name: ['Alice', 'Bob', 'Charlie'],
        age: [null, 30, 25]
    },
    "[tbl.join.left] Test 3: Left Join with array of columns")

const test_join_table_3 = {
    id: [2, 3, 4],
    name: ['AliceX', 'BobX', 'CharlieX'],
    age: [30, 25, 22]}

assertEqual(
    tbl(test_join_table_1).join().left(test_join_table_3, 'id', (val1, val2) => val1).data,
    {
        id: [1, 2, 3],
        name: ['Alice', 'Bob', 'Charlie'],
        age: [null, 30, 25]},
    "[tbl.join.left] Test 4: Left Join with conflict resolution")

assertEqual(
    tbl(test_join_table_1).join().right(test_join_table_2, 'id').data,
    {
        id:   [2, 3, 4],
        name: ['Bob', 'Charlie', null],
        age:  [30, 25, 22]},
    "[tbl.join.right] Test 5: Right Join")

assertEqual(
    tbl(test_join_table_1).join().inner(test_join_table_2, 'id').data,
    {
        id: [2, 3],
        name: ['Bob', 'Charlie'],
        age: [30, 25]},
    "[tbl.join.inner] Test 6: Inner Join")

assertEqual(
    tbl(test_join_table_1).join().full(test_join_table_2, 'id').data,
    {
        id: [1, 2, 3, 4],
        name: ['Alice', 'Bob', 'Charlie', null],
        age: [null, 30, 25, 22] },
    "[tbl.join.full] Test 7: Full Join")

assertError(
    () => tbl(test_join_table_1).join().left(test_join_table_2, 'invalidColumn'),
    "Column 'invalidColumn' not found in the first table");

const test_join_table_4 = {
    id: [2, 3, 4],
    fullname: ['Alice', 'Charlie', 'David'],
    age: [30, 25, 22]}

assertEqual(
    tbl(test_join_table_1).join().inner(test_join_table_4, ['id', { name: 'fullname' }]).data,
    {
        id: [3],
        name: ['Charlie'],
        fullname: ['Charlie'],
        age: [25]},
    "[tbl.join.inner] Test 9: Multiple columns join")

assertEqual(
    tbl({id: [], name: []}).join().left(test_join_table_4, 'id').data,
    {
        id:       [2, 3, 4],
        name:     [null, null, null],
        fullname: ['Alice', 'Charlie', 'David'],
        age:      [30, 25, 22]},
    "[tbl.join.inner] Test 10: join empty table")

assertEqual(
    tbl(
        {
            id:   [1, 2, 3],
            name: ['Alice', 'Bob', 'Charlie']}
        ).join().exclude(
            {
                id:  [3, 4],
                age: [25, 22]}, 
            'id'
        ).data,
    {
        id:   [1,       2],
        name: ['Alice', 'Bob'],
        age:  [null,    null]},
    "[tbl.join.exclude] Значения из первой таблицы удалены по значениям из второй по ключу")

assertEqual(
    tbl({id: []}).join().full(test_join_table_2, 'id').data, 
    {"id":[2,3,4],"age":[30,25,22]},
    "[tbl.join.full] Присоединение пустой таблицы")
    
    
assertEqual(tbl({
    col1: [1, 2, 3],
    col2: ['a', 'b', 'c'],
    col3: [11, 12, 13]}).over().where("col1 >= 2").select("col4 = 55").data,
    {
        "col1": [1,    2,   3],
        "col2": ["a",  "b", "c"],
        "col3": [11,   12,  13],
        "col4": [null, 55,  55]},
    "[tbl.over.where.select] Проверка модификации некоторых таблицы (создается новый столбец)")

assertEqual(tbl({
    col1: [1, 2, 3],
    col2: ['a', 'b', 'c'],
    col3: [11, 12, 13]}).over().where("col1 >= 22").select("col4 = 55").data,
    {
        col1: [1, 2, 3],
        col2: ['a', 'b', 'c'],
        col3: [11, 12, 13]},
    "[tbl.over.where.select] Проверка что ничего не произошло и ничего не упало")
    
assertEqual(
    tbl(
        {
            col1: [1, 2, 3],
            col2: ['a', 'b', 'b'],
            col3: [10, 20, 30]
        }).over().partitionBy("col2").select("col4 = col3 + 5").data,
    {
        col1: [1, 2, 3],
        col2: ['a', 'b', 'b'],
        col3: [10, 20, 30],
        col4: [15, 25, 35]},
    "[tbl.over.partitionBy] Partition by one column is passed with valid arithmetic operation")

assertEqual(
    tbl(
        {
            col1: [2, 2, 3, 4],
            col2: ['a', 'a', 'b', 'b'],
            col3: [10, 20, 30, 40]
        }).over().partitionBy("col1", "col2").select("col4 = sum(agg$col3)").data,
    {
        col1: [2, 2, 3, 4],
        col2: ['a', 'a', 'b', 'b'],
        col3: [10, 20, 30, 40],
        col4: [30, 30, 30, 40]},
    "[tbl.over.partitionBy] Partition by n columns are passed and used aggregate sum function")

assertError(
    () => 
        tbl({
            col1: [1, 2, 3],
            col2: ['a', 'b', 'c']
        }).over().partitionBy().select("col4 = 42").data,
    "[tbl.over.partitionBy] Partition columns is not specified - it doesn't make sense")
    
assertError(
    () => tbl(
        {
            col1: [1, 2, 3],
            col2: ['a', 'b', 'c']
        }).over().partitionBy("nonExistentColumn").select("col4 = 99").data,
    "[tbl.over.partitionBy] Column(s) 'nonExistentColumn' does not exist")

assertEqual(
    tbl(
        {
            col1: [2, 2, 3, 4, 5, 5],
            col2: ['a', 'a', 'b', 'b', null, null],
            col3: [10, 20, 30, 40, 50, 60]
        }).over().where("col2 != null").groupBy("col2").select("col4 = sum(agg$col3)").data,
    {
        col1: [2,   3,   5,    5   ],
        col2: ['a', 'b', null, null],
        col3: [10,  30,  50,   60  ],
        col4: [30,  70,  null, null]},
    "[tbl.over.where.groupBy] Одновременная отработка where и groupBy")
    
let tbl_tmp = tbl({col1: [1, 2, 3],col2: ['a', 'b', 'c']})
    .constraints.setCondition('col1', val => val > 0).setNotNull("col1").setNotNull("col2").end()
assertEqual(
    tbl(tbl_tmp).constraints.count(), 3,
    "[tbl.class] Тестирование сохранности классовых метаданных при случайном переобъявлении класса")

assertEqual(  
    Object.keys(tbl(
        {
            col1: [2, 2, 3, 4, 5, 5],
            col2: ['a', 'a', 'b', 'b', null, null],
            col3: [10, 20, 30, 40, 50, 60]
        }).constraints.setNotNull("col1").setNotNull("col3").setUnique("col3").end()
        .select("col4 = sum(agg$col3)").constraints.cache), 
    ["col1","col3","unique_col3"],
    "[tbl.constraints.cache -> select] После select -> кэш constraints сохранен")

assertEqual(  
    Object.keys(tbl(
        {
            col1: [2, 2, 3, 4, 5, 5],
            col2: ['a', 'a', 'b', 'b', null, null],
            col3: [10, 20, 30, 40, 50, 60]
        }).constraints.setNotNull("col1").setNotNull("col3").setUnique("col3").end()
        .over().where("col2 != null").groupBy("col2").select("col4 = sum(agg$col3)").constraints.cache), 
    ["col1","col3","unique_col3"],
    "[tbl.constraints.cache -> over...] После over манипуляций кэш constraints сохранен")

assertEqual(  
    Object.keys(tbl(
        {
            col1: [2, 2, 3, 4, 5, 5],
            col2: ['a', 'a', 'b', 'b', null, null],
            col3: [10, 20, 30, 40, 50, 60]
        }).constraints.setNotNull("col1").setNotNull("col3").setUnique("col3").end()
        .join().left(test_join_table_1, {col1: "id"}).constraints.cache), 
    ["col1","col3","unique_col3"],
    "[tbl.constraints.cache -> join] После join манипуляций кэш constraints сохранен")



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 5: DATAVIEW(JS)/OBSIDIAN FUNCTIONS ----------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Специфические функции именно для обсидиана/dataview(js)

// Тезаурус
// + path - строковый путь к заметке -> легко проводить операции дедубликации + трансформировать в link/metalink
// + link - урезанная ссылка dataview(js)-obsidian 
//     (простейшая, обладает свойством .path, которое возвращает строковый путь к заметке)
// + metalink - полноинформативная ссылка dataview(js)-obsidian в виде глубокого дерева со всеми метаданными

//----------------------------------------------------------------------------------------------------------------------
// @note Common functions 
//----------------------------------------------------------------------------------------------------------------------
// Печать объекта в obsidian
function print(string) {
    
    dv.el("p", string)
    // console.log(string)
}


//----------------------------------------------------------------------------------------------------------------------
// @note Metalinks functions 
//----------------------------------------------------------------------------------------------------------------------
// Трансформация строковых путей в links
function pathToMetalink(x) {
    return dv.page(x)
}

//----------------------------------------------------------------------------------------------------------------------
// Трансформация links в строковые пути
function linkToPath(x) {
    return x.path
}

function pathToLink(x) {
    let metalink = pathToMetalink(x)
    if(metalink === undefined) {
        // Если встретился рудимент - надо сподвигнуть его удалить нахер, а не хранить мусор в обсидиане
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
        throw new Error("\"" + x + "\" - не существует! В Obsidian нужно удалить/создать эту заметку!")
    } else {
        return pathToMetalink(x).file.link
    }
}



//----------------------------------------------------------------------------------------------------------------------
// Трансформация links в металинки
function linkToMetalink(x) {
    return pathToMetalink(linkToPath(x))
}


//----------------------------------------------------------------------------------------------------------------------
// Трансформация links в строковые имена
function linkToName(x) {
    return linkToMetalink(x).file.name
}


//----------------------------------------------------------------------------------------------------------------------
// @note Arrays
//----------------------------------------------------------------------------------------------------------------------
// Извлечение из массива links - строковых путей
function arrayLinksToPaths(arr) {
    return toArray(arr).map(x => linkToPath(x))
}


//----------------------------------------------------------------------------------------------------------------------
// Трансформация массива ссылок в имена
function arrayLinksToNames(arr) {
    return toArray(arr).map(x => linkToName(x))
}


//----------------------------------------------------------------------------------------------------------------------
// Трансформация массива путей/имен в ссылки
function arrayPathsToLinks(arr) {
    // return toArray(arr).map(x => {
    //     let metalink = pathToMetalink(x)
    //     if(metalink === undefined) {
    //         // Если встретился рудимент - надо сподвигнуть его удалить нахер, а не хранить мусор в обсидиане
    //         // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
    //         throw new Error("\"" + x + "\" - не существует! В Obsidian нужно удалить/создать эту заметку!")
    //     } else {
    //         return pathToMetalink(x).file.link
    //     }
    // })
    return toArray(arr).map(x => pathToLink(x))
}


//----------------------------------------------------------------------------------------------------------------------
// Трансформация имен в links
function arrayNamesToLinks(arr) {
    // УДАЛИТЬ МЕНЯ ПОПОЗЖЕ 2024.06.01
    // return toArray(arr).map(x => pathToMetalink(x).file.link)
    return arrayPathsToLinks(arr)
}


//----------------------------------------------------------------------------------------------------------------------
// Дедубликация массива линков
// Нужно переводить ссылки в пути для дедубликации из-за того, что на практике две ссылки на одну заметку 
// могут считаться алгоритмом разными (возможно рандомайзер дерево метаданных построил по разному, хз)
function arrayLinksDeduplicate(arr) {
    return arrayPathsToLinks(arrayDeduplicate(arrayLinksToPaths(arr)))
}


//----------------------------------------------------------------------------------------------------------------------
// Мердж двух массивов линков с дедубликацией
// Нужно переводить ссылки в пути для дедубликации из-за того, что на практике две ссылки на одну заметку 
// могут считаться алгоритмом разными (возможно рандомайзер дерево метаданных построил по разному, хз)
function arrayLinksMergeDeduplicated(arr_1, arr_2) {
    return arrayPathsToLinks(
        arrayDeduplicate(
            arrayMerge(
                arrayLinksToPaths(arr_1), 
                arrayLinksToPaths(arr_2))))
}


//----------------------------------------------------------------------------------------------------------------------
// Исключение из массива ЛИНКОВ arr_1_from элементов найденных в arr_2_source
function arraysLinksExclude(arr_1_from, arr_2_source) {
    return arrayPathsToLinks(
        arraysExclude(
            arrayLinksToPaths(arr_1_from), 
            arrayLinksToPaths(arr_2_source)))
}


//----------------------------------------------------------------------------------------------------------------------
// Функция фильтрации массива ссылок от всех вложенных файлов (берутся только заметки)
function arrayFilterOnlyNotes(arr_links_raw) {
    return arrayPathsToLinks(linkToPath(arr_links_raw).filter(x => x.match("\.md$")));
}


//------------------------------------------------------------------------------------------------------------------
// Фильтрация массива линков от текущей заметки (если есть)
// Также дополнительно инъектирована ручная фильтрация через properties (js_filter_links)
function arrayBackendFilter(arr) {
    // flag i - case insensetice
    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    let str_regex_condition = new RegExp(arrayVoidRemove(toArray(dv.current().js_filter_links))[0], "i")
    
    // Фильтрация массива линков от текущей заметки (если есть)
    let arr_output = arr.filter(x => linkToPath(x) != dv.current().file.path)
    
    // Дополнительно - кастомная фильтрация из properties (если указан), либо без изменений
    if(str_regex_condition.length != 0) {
        return arrayPathsToLinks(arrayLinksToNames(arr_output).filter(x => x.match(str_regex_condition)))
    } else {
        return arr_output
    }
}



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 6: BACKEND: COMMON FUNCTIONS ----------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Внутренние функции для подсчета и аналитики данных

// Извлечение "прямых" ссылок из свойств идущих прямо из текущих заметок
function processFindPropertyFromNotes(arr_links, str_property) {
    // Если на входе одиночный объект - преобразование массив длины 1 -> далее извлечение ссылок из свойства
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
    let arr_cache_links_out = toArray(arr_links).map(x => eval("linkToMetalink(x)." + str_property))
    
    // Чистка от пустот + нормализация массива (все вложенности выводятся наверх) + возрат наружу
    return arrayFlat(arrayVoidRemove(arr_cache_links_out))
}


//------------------------------------------------------------------------------------------------------------------
// Извлечение "входящих" ссылок из свойств идущих прямо в текущие заметки
function processFindPropertyInNotes(arr_links, str_property) {
    // Массив найденных входящих ссылок из свойств
    let arr_cache_links_in = []
    
    // Отдельная обработка каждой заметки
    for (let x1_note of toArray(arr_links)) {
        // Массив всех входящих заметок
        let arr_x1_note_inlinks = linkToMetalink(x1_note).file.inlinks
        
        // Нужно найти все входящие заметки, у которых ссылка из свойств - текущая x1_note заметка
        // На выходе должен быть массив boolean длиной эквивалентной списку текущих входящих заметок
        let arr_x1_bool_is_inlink_target = []
        for (let x2_inlink of arr_x1_note_inlinks) {
            // извлечение всех ссылок из свойств для текущей входящей заметки
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval
            let x2_inlink_property = eval("linkToMetalink(x2_inlink)." + str_property)
            
            // В анализ берутся все заметки у которых есть хоть 1 ссылка из свойств, иначе связь отсутствует (false)
            if(Array.isArray(x2_inlink_property)) {
                // На выходе в массив добавляется ОДНО значение true/false 
                // Найдено ли хоть одно обращение к текущей заметке в ссылке из свойств входящей заметки?
                // Если да - то все прочие ссылки из свойств входящей заметки являются целевыми для текущей заметки
                arr_x1_bool_is_inlink_target.push(
                    max(x2_inlink_property.map(x => linkToPath(x) == linkToPath(x1_note))))
            } else { // false если это не массив (значит какая-то пустота пришла)
                arr_x1_bool_is_inlink_target.push(false)
            }
        }
        
        // Фильтрация массива входящих заметок по массиву найденых совпадений 
        // (у которых в целевом свойстве указана текущая заметка)
        arr_cache_links_in.push(
            arrayFilterByAnotherArrayBool(
                arr_x1_note_inlinks, 
                arr_x1_bool_is_inlink_target))
    }
    
    // Возвращение навыход нормализованного массива
    return arrayFlat(arr_cache_links_in)
}


//------------------------------------------------------------------------------------------------------------------
// Извлечение кастомной сортировки из properties
function getSortObject() {
    // Извлечение из properties
    let arr_sort_conditions = arrayVoidRemove(toArray(dv.current().js_sort))
    
    if(arr_sort_conditions.length > 0) {
        let obj_return = {}
        for (let x_str_condition_raw of arr_sort_conditions) {
            // https://stackoverflow.com/questions/49802044/split-string-in-array-by-space-in-javascript
            let x_arr_condition = x_str_condition_raw.split(" ")
            // https://stackoverflow.com/questions/1168807/how-can-i-add-a-key-value-pair-to-a-javascript-object
            eval("obj_return[\"" + x_arr_condition[0] + "\"] = \""+ x_arr_condition[1] + "\"")
        }
        return obj_return
    } else {
        return {num_childrens: "desc", num_mentions_all: "desc", links: "asc"}
    }
}



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 7: BACKEND: CORE FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------
// Подготовка массива детей для текущей заметки
function backendGetChildren(link_current) {
    // Объединение двух массивов в один дедублицированный
    return arrayBackendFilter(arrayLinksMergeDeduplicated(
        // Извлечение "прямых" сиблингов идущих прямо из текущих заметок
        processFindPropertyFromNotes(link_current, "children"),
        // Извлечение "входящих" сиблингов идущих прямо в текущие заметки    
        processFindPropertyInNotes(link_current,   "parents")))
}


//----------------------------------------------------------------------------------------------------------------------
// Подготовка массива родителей для текущей заметки
function backendGetParents(link_current) {
    // Объединение двух массивов в один дедублицированный
    return arrayBackendFilter(arrayLinksMergeDeduplicated(
        // Извлечение "прямых" сиблингов идущих прямо из текущих заметок
        processFindPropertyFromNotes(link_current, "parents"),
        // Извлечение "входящих" сиблингов идущих прямо в текущие заметки    
        processFindPropertyInNotes(link_current,   "children")))
}


//----------------------------------------------------------------------------------------------------------------------
// Подготовка массива сиблингов/антагонистов для текущей заметки
function backendGetOneLvlTbl(link_current, str_property) {
    //------------------------------------------------------------------------------------------------------------------
    // VARIABLES
    
    // Таблица итоговых найденных сиблингов-линков
    // Первым (и корневым) линком-сиблингом является текущая заметка
    let tbl_siblings_final = tbl({links: [link_current], lvl: [0]})
    
    // Кеш-массив для хранения сиблингов
    let x_arr_cache_siblings_all = []

    // Кеш-массив всех новонайденных заметок за текущую итерацию
    let x_arr_cache_siblings_all_new = tbl_siblings_final.getCol('links')
    
    // Настройки while-цикла - счетчик текущих итераций + максимально допустимое количество итераций 
    // (чтобы не уходить в вечный цикл)
    let x_while_iter = 0
    let x_while_max_iters = 10000
    

    //------------------------------------------------------------------------------------------------------------------
    // PROCESSING
    
    // Процесс-ядро
    while(true) {
        // Объединение двух массивов в один дедублицированный кеш-массив - все найденные сиблинги
        x_arr_cache_siblings_all = arrayLinksMergeDeduplicated(
            // Извлечение "прямых" сиблингов идущих прямо из текущих заметок
            processFindPropertyFromNotes(x_arr_cache_siblings_all_new, str_property),
            // Извлечение "входящих" сиблингов идущих прямо в текущие заметки    
            processFindPropertyInNotes(x_arr_cache_siblings_all_new, str_property))

        // Поиск НОВОНАЙДЕННЫХ сиблингов за текущую итерацию (чтобы понимать, надо ли искать сиблинги дальше)
        // Для этого исключаются все ранее найденные
        x_arr_cache_siblings_all_new = arraysLinksExclude(x_arr_cache_siblings_all, tbl_siblings_final.getCol('links'))
        

        // Инъекция новонайденных заметок в таблицу всех ранее найденных
        tbl_siblings_final = tbl_siblings_final
            .join().full({links: x_arr_cache_siblings_all_new}, 'links')
            .over().where('lvl == null').select(`lvl = ${x_while_iter + 1}`)
            
        // Завершение если новых сибсиблингов не найдено 
        if(x_arr_cache_siblings_all_new.length == 0) { break }
        
        // блок-страховка, на случай если что-то где-то сломается и условие выхода внезапно окажется недостижимым
        x_while_iter += 1
        if(x_while_iter == x_while_max_iters) {
            print("The allowable iteration limit of " + x_while_max_iters + " has been reached")
            break
        }
    }
    
    // По линкам не джойнится, нужен путь + имя (т.к. это уникальное имя)
    let tbl_siblings_filtered = {links: arrayLinksToPaths(arrayBackendFilter(tbl_siblings_final.getCol('links')))}
    
    // Очистка от лишних ссылок (в т.ч. через регулярку поданную в интерфейсе)
    tbl_siblings_final.select('links = linkToPath(links)')
        .join().inner(tbl_siblings_filtered, "links")
        .select('links = pathToLink(links)')
        // Поиск кол-ва всех детей
        .select('num_childrens = numberToStringWithoutZeros(backendGetChildren(links).length)')
        // Поиск кол-ва всех упоминаний
        .select(`num_mentions_all = numberToStringWithoutZeros(
            arrayLinksMergeDeduplicated(
                arrayFilterOnlyNotes(linkToMetalink(links).file.inlinks),
                arrayFilterOnlyNotes(linkToMetalink(links).file.outlinks)).length)`)

    return tbl_siblings_final
}


//----------------------------------------------------------------------------------------------------------------------
// Подготовка массива родителей для текущей заметки
function backendGetMentions(link_current, arr_exclude, str_where) {
    return arrayLinksDeduplicate(
        arrayBackendFilter(
            arraysLinksExclude(
                arrayFilterOnlyNotes(eval("linkToMetalink(link_current).file." + str_where)),
                arr_exclude)))
}



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 8: FRONTEND FUNCTIONS -----------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Функция отрисовки типовой таблицы
function frontendBuildTableOneLvl(tbl_input, str_colname, str_comment, callout_type = "tip") {
    if(tbl_input.count() > 0) {
        
        // Шапка
        str_header = "\n<br>\n\n" + 
            "> [!" + callout_type + "]+ " + str_colname + " (" + tbl_input.count() + ")\n" + 
            "> " + str_comment + ":\n" + 
            "> \n"
        
        // Количество уровней
        const arr_lvls = tbl(tbl_input.data).select('lvl').deduplicate().getCol('lvl')
        
        // Выстраивание глубокого дерева
        for (const x_lvl of arr_lvls) {
            if(x_lvl == 1) {// Первую таблицу с прямыми линками прятать не надо
                str_header += 
                    `>\n` + 
                    `><br>\n` + 
                    `>\n` + 
                    `>\n` +
                    `> ` + dv.markdownTable(
                        [
                            frontendColnameWithPopup(
                                "Links",         "[links] Список ссылок"),
                            frontendColnameWithPopup(
                                "Children",      "[num_childrens] Заметка - родитель для такого количества подзаметок"),
                            frontendColnameWithPopup(
                                "(In/Out)links", "[num_mentions_all] Количество уникальных связей заметки")],
                        tbl(tbl_input.data)
                            .where(`lvl == ${x_lvl}`)
                            .select(`-lvl`)
                            .orderBy(getSortObject())
                            .getValuesArrOfArrs())
            } else {// Косвенные линки
                str_header += 
                    `${">".repeat(x_lvl-1)}\n` + 
                    `${">".repeat(x_lvl-1)}<br>\n` + 
                    `${">".repeat(x_lvl-1)}\n` + 
                    `>${">".repeat(x_lvl-1)} [!${callout_type}]${x_lvl == 2 ? '-' : '+'} ` + 
                        `lvl of deep (${x_lvl}/${max(arr_lvls)})\n` + 
                    `>${">".repeat(x_lvl-1)} \n` +
                    `>${">".repeat(x_lvl-1)} ` + dv.markdownTable(
                        [
                            frontendColnameWithPopup(
                                "Links",         "[links] Список ссылок"),
                            frontendColnameWithPopup(
                                "Children",      "[num_childrens] Заметка - родитель для такого количества подзаметок"),
                            frontendColnameWithPopup(
                                "(In/Out)links", "[num_mentions_all] Количество уникальных связей заметки")],
                        tbl(tbl_input.data)
                            .where(`lvl == ${x_lvl}`)
                            .select(`-lvl`)
                            .orderBy(getSortObject())
                            .getValuesArrOfArrs())
            }
        }
        
        return str_header
    } else {
        return "\n" + 
            "<br>\n" + 
            "\n" + 
            "> [!quote] " + str_colname + " (" + tbl_input.count() + ")\n"
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Функция отрисовки типовой таблицы
function frontendBuildTable(arr, str_colname, str_comment, callout_type = "tip") {
    //------------------------------------------------------------------------------------------------------------------
    // Сборка таблицы в предварительном формате - для последующих сортировки/фильтрации/очистки и постобработки
    function buildTableRaw(arr_links) {
        // Массив объектов ключ=значение
        let arr_table_rows = []
        
        // Обработка по отдельности каждой ссылки
        for (let link of arr_links) {
            // Поиск всех детей
            let link_children = backendGetChildren(link)
            
            // Поиск всех упоминаний
            let link_mentions_all = arrayLinksMergeDeduplicated(
                arrayFilterOnlyNotes(linkToMetalink(link).file.inlinks),
                arrayFilterOnlyNotes(linkToMetalink(link).file.outlinks))
            
            // Добавление сформированной строки данных
            arr_table_rows.push({
                links:            link, 
                num_childrens:    link_children.length, 
                num_mentions_all: link_mentions_all.length})
        }
        
        return arr_table_rows
    }
    
    
    //------------------------------------------------------------------------------------------------------------------
    // Функция преобразования контента столбцов в итоговый вид (например - удаление нулевых ячеек в числовых столбцах)
    function tableRawFrontend(table_raw) {
        let arr_output = []
        
        //--------------------------------------------------------------------------------------------------------------
        // Визуализация: Если 0 - удаление. Так удобнее ориентироваться на практике
        function numberToStringWithoutZeros(number) {
            if(number == 0) {
                return ""
            } else {
                return number.toString()
            }
        }
        
        //--------------------------------------------------------------------------------------------------------------
        // Преобразование 
        for (let element of table_raw) {
            element["num_childrens"]    = numberToStringWithoutZeros(element["num_childrens"])
            element["num_mentions_all"] = numberToStringWithoutZeros(element["num_mentions_all"])
            arr_output.push(element)
        }
        
        return arr_output
    }
    
    
    //------------------------------------------------------------------------------------------------------------------
    // Преобразование массива объектов в массив массивов 
    // Для соответствия требованиям функции dv.table
    // https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvtableheaders-elements
    function tableRawToDvTable(arr_of_objects) {
        let arr_output = []
        for (let object of arr_of_objects) {
            arr_output.push(Object.values(object))
        }
        return arr_output
    }
    
    
    //------------------------------------------------------------------------------------------------------------------
    // Итоговый процесс отрисовки --------------------------------------------------------------------------------------
    if(arr.length > 0) {
        // Почему-то только markdown-таблица отрисовывается в callout-е
        // https://blacksmithgu.github.io/obsidian-dataview/api/code-reference/#dvmarkdowntableheaders-values
        return "\n" + 
            "<br>\n" + 
            "\n" + 
            "> [!" + callout_type + "]+ " + str_colname + " (" + arr.length + ")\n" + 
            "> " + str_comment + ":\n" + 
            "> \n" +
            "> " + 
            dv.markdownTable([
                    frontendColnameWithPopup(
                        "Links",         "[links] Список ссылок"), 
                    frontendColnameWithPopup(
                        "Children",      "[num_childrens] Заметка - родитель для такого количества подзаметок"),
                    frontendColnameWithPopup(
                        "(In/Out)links", "[num_mentions_all] Количество уникальных связей заметки")],
                tableRawToDvTable(
                    tableRawFrontend(
                        buildTableRaw(arr)
                        .tableSortByKeys(getSortObject()))))
    } else {
        return "\n" + 
            "<br>\n" + 
            "\n" + 
            "> [!quote] " + str_colname + " (" + arr.length + ")\n"
    }
}



//----------------------------------------------------------------------------------------------------------------------
// BLOCK 9: CORE -------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Итоговая сборка

// Текущая заметка
// Проблематика - иногда выдается undefined вместо ссылки на текущую заметку: 
// [[Obsidian - dataview - js - failtures - problem with dataview (dv.current)]]
const link_current    = dv.current().file.link

// Определение массивов ссылок из свойств
const arr_children    = backendGetChildren(link_current)
const tbl_siblings    = backendGetOneLvlTbl(link_current, "siblings")
const tbl_antagonists = backendGetOneLvlTbl(link_current, "antagonists")
const arr_parents     = backendGetParents(link_current)

// Определение массивов ссылок из тела заметок (только упоминания)
const arr_links_from_properties = arrayLinksDeduplicate(
    arr_children.concat(tbl_siblings.getCol('links')).concat(tbl_antagonists.getCol('links')).concat(arr_parents))

// Определение массивов упоминаний
const arr_mentions_in   = backendGetMentions(link_current, arr_links_from_properties, "inlinks")
const arr_mentions_from = backendGetMentions(link_current, arr_links_from_properties, "outlinks")


//----------------------------------------------------------------------------------------------------------------------
// Отрисовка
str_dttm_file_created  = "`=dateformat(this.file.ctime, \"yyyy/MM/dd HH:mm:ss\")`"
str_dttm_file_modified = "`=dateformat(this.file.mtime, \"yyyy/MM/dd HH:mm:ss\")`"
dbl_count_of_links = '' + arrayLinksDeduplicate(
    arr_links_from_properties.concat(arr_mentions_in).concat(arr_mentions_from)).length
dv.paragraph(
    "| **Date created**         | **Date modified**         | **Count of links**    |\n" + 
    "| :----------------------- | :------------------------ | :-------------------: |\n" + 
    `| ${str_dttm_file_created} | ${str_dttm_file_modified} | ${dbl_count_of_links} |\n` + 
    frontendBuildTable(arr_parents,           "1\\. Parents",         "У заметки следующие родители") + 
    frontendBuildTableOneLvl(tbl_siblings,    "2\\. Siblings",        "У заметки следующие siblings") + 
    frontendBuildTableOneLvl(tbl_antagonists, "3\\. Antagonists",     "У заметки следующие antagonists", "fail") + 
    frontendBuildTable(arr_children,          "4\\. Children",        "Заметка является родителем для") + 
    frontendBuildTable(arr_mentions_in,       "5\\. Is mentioned in", "Заметка упомянута в") + 
    frontendBuildTable(arr_mentions_from,     "6\\. Mentioned these", "Заметка упомянула следующие")
)


//----------------------------------------------------------------------------------------------------------------------
// Чекинг времени отработки скрипта: отчет
const dttm_script_end = performance.now();
print(`Time elapsed: ${normalizeMilliseconds(dttm_script_end - dttm_script_start)}`)
