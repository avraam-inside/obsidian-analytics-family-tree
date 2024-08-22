/*----------------------------------------------------------------------------------------------------------------------
Особенности по примененным приемам JS см тут: [[Obsidian - dataview - js (dataviewjs)]]


------------------------------------------------------------------------------------------------------------------------
Ручная кастомизация вывода (сортировка, фильтрация, раскрытость)
Возможные значения тут: [[script - analytics - properties]]
*/

//----------------------------------------------------------------------------------------------------------------------
// COMMON FUNCTIONS ----------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// В javascript-е всё через жопу походу делается, поэтому приходится вручную базовые функции добавлять

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
// Функция max которая подсчитывает максимальное значение в массиве
// По какой-то причине в самом js функция max реализована через жопу
// (в т.ч. если на входе принят boolean-массив - то и максимальное значение будет boolean-типа)
// Тип элементов массива определяется по первому элементу (массив может содержать разноэлементные значения)
function max(arr) {
    if(typeof(arr[0]) == "boolean") {
        // По какой-то наркоманской причине надо результат сперва вытащить в переменную
        // А только после можно вернуть на выход
        let bool_return = 
            Boolean( // https://stackoverflow.com/a/64969481
                Math.max( // https://stackoverflow.com/a/39106546
                    ...arr)) // https://builtin.com/articles/three-dots-in-javascript
        
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions
        return bool_return
    } else {
        return arr
    }
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
// Сортировка массива объектов в адекватном sql-формате
// https://stackoverflow.com/questions/2784230/how-do-you-sort-an-array-on-multiple-columns
//
// Пример:
// var arr_of_objects = [
//     {USER:"bob",  SCORE:2000, TIME:32, AGE:16, COUNTRY:"US"},
//     {USER:"jane", SCORE:4000, TIME:35, AGE:16, COUNTRY:"DE"}
// ];
// arr_of_objects.keySort({SCORE:"desc", TIME:"asc", AGE:"asc"})
Array.prototype.keySort = function(keys) {
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


//----------------------------------------------------------------------------------------------------------------------
// DATAVIEW(JS)/OBSIDIAN FUNCTIONS -------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Специфические функции именно для обсидиана/dataview(js)

// Тезаурус
// + path - строковый путь к заметке -> легко проводить операции дедубликации + трансформировать в link/metalink
// + link - урезанная ссылка dataview(js)-obsidian 
//     (простейшая, обладает свойством .path, которое возвращает строковый путь к заметке)
// + metalink - полноинформативная ссылка dataview(js)-obsidian в виде глубокого дерева со всеми метаданными


//----------------------------------------------------------------------------------------------------------------------
// Печать объекта в obsidian
function print(string) {
    dv.el("p", string)
}


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
    return toArray(arr).map(x => {
        let metalink = pathToMetalink(x)
        if(metalink === undefined) {
            // Если встретился рудимент - надо сподвигнуть его удалить нахер, а не хранить мусор в обсидиане
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/throw
            throw new Error("\"" + x + "\" - не существует! В Obsidian нужно удалить/создать эту заметку!")
        } else {
            return pathToMetalink(x).file.link
        }
    })
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
// BACKEND: COMMON FUNCTIONS -------------------------------------------------------------------------------------------
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



//----------------------------------------------------------------------------------------------------------------------
// BACKEND: CORE FUNCTIONS
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
// Подготовка массива сиблингов для текущей заметки
function backendGetOneLvl(link_current, str_property) {
    //------------------------------------------------------------------------------------------------------------------
    // VARIABLES 
    
    // Массив итоговых найденных сиблингов-линков
    // Первым (и корневым) линком-сиблингом является текущая заметка
    let arr_siblings_final = link_current
    
    
    //------------------------------------------------------------------------------------------------------------------
    // PROCESSING 
    
    // Кеш-массив для хранения сиблингов
    let x_arr_cache_siblings_all = []

    // Кеш-массив всех новонайденных заметок за текущую итерацию
    let x_arr_cache_siblings_all_new = arr_siblings_final

    // Настройки while-цикла - счетчик текущих итераций + максимально допустимое количество итераций 
    // (чтобы не уходить в вечный цикл)
    let x_while_iter = 0
    let x_while_max_iters = 10000

    // Процесс-ядро
    while(true) {
        // Объединение двух массивов в один дедублицированный x_arr_cache_siblings_all - все найденные сиблинги
        x_arr_cache_siblings_all = arrayLinksMergeDeduplicated(
            // Извлечение "прямых" сиблингов идущих прямо из текущих заметок
            processFindPropertyFromNotes(x_arr_cache_siblings_all_new, str_property),
            // Извлечение "входящих" сиблингов идущих прямо в текущие заметки    
            processFindPropertyInNotes(x_arr_cache_siblings_all_new, str_property))

        // Поиск НОВОНАЙДЕННЫХ сиблингов за текущую итерацию (чтобы понимать, надо ли искать сиблинги дальше)
        x_arr_cache_siblings_all_new = arraysLinksExclude(x_arr_cache_siblings_all, arr_siblings_final)

        // Инъекция новонайденных заметок в массив всех ранее найденных
        arr_siblings_final = arrayLinksMergeDeduplicated(arr_siblings_final, x_arr_cache_siblings_all_new)
        
        // Завершение если новых субсиблингов не найдено 
        if(x_arr_cache_siblings_all_new.length == 0) { break }
        
        // блок-страховка, на случай если что-то где-то сломается и условие выхода внезапно окажется недостижимым
        x_while_iter += 1
        if(x_while_iter == x_while_max_iters) {
            print("The allowable iteration limit of " + x_while_max_iters + " has been reached")
            break
        }
    }
    
    return arrayBackendFilter(arr_siblings_final)
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
// FRONTEND FUNCTIONS --------------------------------------------------------------------------------------------------
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
    // Преобразование массива объектов в массив массов 
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
    // Подготовка текста столбца с подсказкой
    function frontendColnameWithPopup(str_colname, str_popup) {
        return "<abbr title=\"" + str_popup + "\">" + str_colname + "</abbr>"
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
                        .keySort(getSortObject()))))
    } else {
        return "\n" + 
            "<br>\n" + 
            "\n" + 
            "> [!quote] " + str_colname + " (" + arr.length + ")\n"
    }
}



//----------------------------------------------------------------------------------------------------------------------
// CORE ----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Итоговая сборка

// Текущая заметка
// Проблематика - иногда выдается undefined вместо ссылки на текущую заметку: 
// [[Obsidian - dataview - js - failtures - problem with dataview (dv.current)]]
const link_current = dv.current().file.link

// Определение массивов ссылок из свойств
const arr_children    = backendGetChildren(link_current)
const arr_siblings    = backendGetOneLvl(link_current, "siblings")
const arr_antagonists = backendGetOneLvl(link_current, "antagonists")
const arr_parents     = backendGetParents(link_current)

// Определение массивов ссылок из тела заметок (только упоминания)
const arr_links_from_properties = arrayLinksDeduplicate(
    arr_children.concat(arr_siblings).concat(arr_antagonists).concat(arr_parents))

// Определение массивов упоминаний	
const arr_mentions_in   = backendGetMentions(link_current, arr_links_from_properties, "inlinks")
const arr_mentions_from = backendGetMentions(link_current, arr_links_from_properties, "outlinks")


//----------------------------------------------------------------------------------------------------------------------
// Отрисовка
dv.paragraph(
    "| **Date created**  | `=dateformat(this.file.ctime, \"yyyy-MM-dd, HH:mm:ss\")`     |\n" + 
    "| :---------------- | :---------------------------------------------------------   |\n" + 
    "| **Date modified** | **`=dateformat(this.file.mtime, \"yyyy-MM-dd, HH:mm:ss\")`** |\n" + 
    frontendBuildTable(arr_parents,       "1\\. Parents",         "У заметки следующие родители") + 
    frontendBuildTable(arr_siblings,      "2\\. Siblings",        "У заметки следующие siblings") + 
    frontendBuildTable(arr_antagonists,   "3\\. Antagonists",     "У заметки следующие antagonists", "fail") + 
    frontendBuildTable(arr_children,      "4\\. Children",        "Заметка является родителем для") + 
    frontendBuildTable(arr_mentions_in,   "5\\. Is mentioned in", "Заметка упомянута в") + 
    frontendBuildTable(arr_mentions_from, "6\\. Mentioned these", "Заметка упомянула следующие")
)