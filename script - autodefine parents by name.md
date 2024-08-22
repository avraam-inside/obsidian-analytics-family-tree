<%*
/*----------------------------------------------------------------------------------------------------------------------
Алгоритм автоопределения родителей для заметки на базе лексем через " - "

Находится УМЕРЕННОЕ количество связей
Нажимать на крестики попроще чем прописывать связи вручную для вложенных заметок 
+ да, можно забыть убрать, но пока в работе гипотеза, что это менее критично

------------------------------------------------------------------------------------------------------------------------
Макроуровень

+ Идея:
    + Можно автоматически определить родителей для создаваемой заметки по префиксам в имени через " - "
        + Можно сопоставлять ключевое слово из префикса - с поиском первой заметки с таким имененем без скобок

+ Итог:
    + список parents в формате - [[link]]
        + Линк-файла откуда создается заметка
        + Линки отпочкованные от имени текущего файла
        (ОСОБЕННОСТИ)
        + Удаляются дубликаты
    + Итоговый вид quickadd - не меняется


------------------------------------------------------------------------------------------------------------------------
Техничнее

+ Введенное имя файла сплитится на элементы через " - "
+ Последний элемент отсекается (т.к. это просто имя текущей заметки)
+ Берется лексема с начала, в цикле (последующие конкатенируются через " - ")
    + В отдельную переменную заносится массив всех возможных заметок
        + Делается второй массив-псевдоиндекс, в котором удаляются все слова в скобках
    + Дальше текущая лексема ищется такими попытками:
        + Слово в слово
        + Слово в слово с игнорированием регистра
        + Слово в слово с удаленными скобками
        + Слово в слово с игнорированием регистра и удаленными скобками
        + Если слово с " - " - то остается только последний элемент справа
            + Прогнать процесс заново, но только для этого слова
    + Итого: 
        + Если что-то нашлось - оно складируется в общий массив и потом отрисовывается
        + Если не нашлось - ничего не складируется
*/

//----------------------------------------------------------------------------------------------------------------------
// PACKAGES ------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
// Скрипт на базе плагинов templater + quickadd + dataview
const dv = this.app.plugins.plugins["dataview"].api



//----------------------------------------------------------------------------------------------------------------------
// COMMON FUNCTIONS ----------------------------------------------------------------------------------------------------
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
// Функция очистки строк от пробелов по краям + множественных пробелов в центре
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/trim
// https://stackoverflow.com/questions/3286874/remove-all-multiple-spaces-in-javascript-and-replace-with-single-space
// Для проверки
// print("   H    w   ".replaceAll(new RegExp("\\s+(?= )", "g"), "").trim().length)
function arrayStrTrim(arr) {
    return arr.map(x => x.replaceAll(new RegExp("\\s+(?= )", "g"), "").trim())
}


//----------------------------------------------------------------------------------------------------------------------
// Функция regex-поиска в массиве
// return - bool-массив
function arrayRegexMatch(arr, str_regex, str_regex_flag = "") {
    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    return arr.map(x => x.match(new RegExp(str_regex, str_regex_flag)) == x)
}


//----------------------------------------------------------------------------------------------------------------------
// Функция regex-замены в массиве
function arrayRegexReplace(arr, str_regex_pattern, str_regex_replacement, str_regex_flag = "") {
    // https://stackoverflow.com/questions/2140627/how-to-do-case-insensitive-string-comparison
    let str_regex_condition = new RegExp(
        str_regex_pattern, 
        // Нужен только глобальный флаг - https://deepscan.io/docs/rules/bad-replace-all-arg
        "g" + str_regex_flag)
    
    // Фильтрация массива линков от текущей заметки (если есть)
    return arr.map(x => x.replaceAll(str_regex_condition, str_regex_replacement))
}



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
// Трансформация массива путей в ссылки
function arrayPathsToLinks(arr) {
    return toArray(arr).map(x => pathToMetalink(x).file.link)
}


//----------------------------------------------------------------------------------------------------------------------
// Трансформация имен в links
function arrayNamesToLinks(arr) {
    return toArray(arr).map(x => pathToMetalink(x).file.link)
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



//----------------------------------------------------------------------------------------------------------------------
// BACKEND: CORE FUNCTIONS
//----------------------------------------------------------------------------------------------------------------------
// obsidian quick add append link to current file in created file
// https://www.reddit.com/r/ObsidianMD/comments/z3hmhq
function backendLastOpenedFile(){
    const lastActiveFile = app.workspace.lastActiveFile;

    // If the last active file is different from the current one, then it can be used
    if (lastActiveFile !== null && lastActiveFile.basename !== tp.file.title ) {
        const lastActiveFileBaseName = lastActiveFile.basename;
        console.log("No match on last active file, using it!. (${lastActiveFileBaseName} !== ${tp.file.title})");
        
        tp.file.move(`${lastActiveFile.parent.path}/${tp.file.title}`);
        
        return lastActiveFileBaseName;
    }

    // If it's the same, then in the history the last opened one can be retrieved.
    const lastFile      = app.workspace.recentFileTracker.lastOpenFiles[0];
    const lastNameParts = lastFile.split("/");
    console.log( "Last active filed matched, using:", lastNameParts);
    const fileName = lastNameParts.pop();
    const name     = fileName.replaceAll(".md", "");

    tp.file.move(`${lastNameParts.join("/")}/${tp.file.title}`);

    return name;
}


//----------------------------------------------------------------------------------------------------------------------
// Поиск существующих заметок по префиксам
function backendSearcher(arr_file_title, arr_notes_all, arr_notes_all_names) {
    //------------------------------------------------------------------------------------------------------------------
    // FUNCTIONS
    
    // Поисковое ядро (переиспользуемый код)
    // функция ищет совпадение word в arr_notes_all_names, 
    // возвращает по индексу значение(я) из arr_notes_all
    function searcherCore(word, arr_notes_all, arr_notes_all_names, str_regex_flag = "") {
        let arr_bool = arrayRegexMatch(arr_notes_all_names, "^\\s*" + word + "\\s*$", str_regex_flag)
        return arrayVoidRemove(arrayFilterByAnotherArrayBool(arr_notes_all, arr_bool))
    }
    
    // Основной алгоритм поиска
    function backendSubSearcher(word, arr_notes_all, arr_notes_all_names) {
        // Проще работать только с массивами
        let arr_output = []
        
        // Слово в слово
        arr_output = searcherCore(word, arr_notes_all, arr_notes_all_names)
        
        // Слово в слово с игнорированием регистра
        if(arr_output.length == 0) {
            arr_output = searcherCore(word, arr_notes_all, arr_notes_all_names, "i")
        }
        
        // Слово в слово с удаленными скобками
        if(arr_output.length == 0) {
            arr_notes_all_names = arrayRegexReplace(arr_notes_all_names, "\\s*\\([^\\)]+\\)\\s*", "")
            arr_output = searcherCore(word, arr_notes_all, arr_notes_all_names)
        }
        
        // Слово в слово с игнорированием регистра и удаленными скобками
        if(arr_output.length == 0) {
            // Скобки удалены ранее выше
            arr_output = searcherCore(word, arr_notes_all, arr_notes_all_names, "i")
        }
        
        return toArray(arr_output)
    }
    
    
    //------------------------------------------------------------------------------------------------------------------
    // VARIABLES: выходной массив
    let arr_output = []
    
    
    //------------------------------------------------------------------------------------------------------------------
    // CORE PROCESS
    
    // https://stackoverflow.com/questions/10993824/do-something-n-times-declarative-syntax
    for (let x = 0; x < arr_file_title.length; x++) {
        // массив для хранения состояния для текущей итерации
        let arr_output_cache = []

        // https://stackoverflow.com/questions/34883068/how-to-get-first-n-number-of-elements-from-an-array
        let x_word = toArray(arr_file_title).slice(0, x + 1).join(" - ")
        
        // Основной поиск
        arr_output_cache = backendSubSearcher(x_word, arr_notes_all, arr_notes_all_names)
        
        // Еще одна попытка для итерации с многосоставным словом 
        // Если слово с " - " - то остается только последний элемент справа 
        // Пример: заметки "Любовь - Психология" нет, будет попытка найти заметку "Психология"
        if (arr_output_cache.length == 0 & x > 0) {
            // Берется только последний правый префикс
            x_word = arr_file_title[x]
            arr_output_cache = backendSubSearcher(x_word, arr_notes_all, arr_notes_all_names)
        }
        
        // Складирование результата
        // Остается только 1 первое совпадение (если вдруг их оказалось несколько)
        arr_output.push(arrayFlat(arr_output_cache)[0])
    }
    
    // Нормализация массива 
    arr_output = arrayVoidRemove(arrayFlat(arr_output))
    
    // Перевод ссылок в обычные имена 
    if(arr_output.length > 0) {
        return arrayVoidRemove(arrayLinksToNames(arr_output))
    } else {
        return []
    }
}


//----------------------------------------------------------------------------------------------------------------------
// Расщепление и поиск ссылок по префиксам у введенного имени
function backendFindLinks(arr_output, str_file_name) {
    // Берется введенное имя текущей заметки
    // Разбивка имени на части-префиксы
    // https://stackoverflow.com/questions/19544452/remove-last-item-from-array
    // Всё что в скобках - не надо анализировать
    let arr_file_title = arrayFlat(
        arrayRegexReplace(toArray(str_file_name), "\\s*\\([^\\)]+\\)\\s*", "").map(x => x.split(" - ")))
    //.slice(0, -1); 
    // убрал вырезание последнего слова на примере заметки Магическое мышление - Лохотрон -> где мне нужны обе заметки
    // let arr_file_title = ["Любовь", "женское мышление", "манипуляции"]
    // let arr_file_title = ["Любовь", "ЖЕНское мышление", "манипулЯЦИИ"]
    // let arr_file_title = ["Любовь", "психология"]
    // let arr_file_title = ["Любовь123", "психология"]
    // let arr_file_title = ["Любовь123", "психология123"]
    // let arr_file_title = []
    // let arr_file_title = ["ЖЕНское мышление", "манипулЯЦИИ"] // ничего не возвращается

    // Если найдены префиксы - начинаем предобработку
    // if(arr_file_title.length > 0) {
    if(arr_file_title.length > 1) {
        // Список всех возможных заметок (оставляем только заметки с расширением .md)
        let arr_notes_all = arrayFilterOnlyNotes(toArray(dv.pages()).file)
        // https://stackoverflow.com/questions/12803604/javascript-array-concat-not-working-why
        arr_output = arrayDeduplicate(arr_output.concat(backendSearcher(arr_file_title, arr_notes_all, 
            // Отдельный параллельный массив только со списком заметок
            arrayStrTrim(arrayLinksToNames(arr_notes_all)))))
    }
    
    return arr_output
}



//----------------------------------------------------------------------------------------------------------------------
// CORE ----------------------------------------------------------------------------------------------------------------
//----------------------------------------------------------------------------------------------------------------------
function main() {
    //------------------------------------------------------------------------------------------------------------------
    // VARTIABLES

    // Массив предлагаемых заметок-родителей
    arr_output = []
    
    
    //------------------------------------------------------------------------------------------------------------------
    // Формирование ссылок из префиксов введенного имени заметки

    arr_output = backendFindLinks(arr_output, tp.file.title)
    

    //------------------------------------------------------------------------------------------------------------------
    // Постобработка
    
    // Убирается текущая заметка из массива родителей
    arr_output = arraysExclude(arr_output, toArray(tp.file.title))
    
    // Оформление массива на выход
    if(arr_output.length >= 1) {
        return "- \"[[" + arr_output.join("]]\"\r\n- \"[[") + "]]\""
    } else {
        return ""
    }
} 
-%>

<% main() %>
