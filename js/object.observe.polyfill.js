/ *!
* Object.observe polyfill - v0.2.4
* por Massimo Artizzu (MaxArt2501)
*
* https://github.com/MaxArt2501/object-observe
*
* Licenciado sob a licença MIT
* Consulte LICENÇA para obter detalhes
* /

// Algumas definições de tipo
/ **
* Isso representa os dados relativos a um objeto observado
* @typedef {Object} ObjectData
manipuladores * @property {Map <Handler, HandlerData>}
* @property {String []} propriedades
* @valores de propriedade
* @property {Descritor []} descritores
* @property {Notificador} notificador
* @property {Boolean} congelado
* @property {Boolean} extensível
* @property {Object} proto
* /
/ **
* Definição de função de um manipulador
* @callback Handler
* @param {ChangeRecord []} muda
* /
/ **
* Isso representa os dados relativos a um objeto observado e um de seus
* manipuladores
* @typedef {Object} HandlerData
* @property {Map <Object, ObservedData>} observado
* @property {ChangeRecord []} changeRecords
* /
/ **
* @typedef {Object} ObservedData
* @property {String []} acceptList
* dados @property {ObjectData}
* /
/ **
* Digite a definição para uma alteração. Qualquer outra propriedade pode ser adicionada usando
* os métodos notify () ou performChange () do notificador.
* @typedef {Object} ChangeRecord
* tipo @property {String}
* @property {Object} objeto
* @property {String} [nome]
* @property {*} [oldValue]
* @property {Number} [index]
* /
/ **
* Definição de tipo para um notificador (o que Object.getNotifier retorna)
* @typedef {Objeto} Notificador
* @property {Function} notificar
* @property {Function} performChange
* /
/ **
* Função chamada com Notifier.performChange. Opcionalmente, pode retornar um
* ChangeRecord que é notificado automaticamente, mas `type` e` object`
* as propriedades são substituídas.
* @callback Performer
* @returns {ChangeRecord | undefined}
* /

Object.observe || (função (O, A, raiz, _ não definida) {
    "use strict";

    / **
    * Relaciona objetos observados e seus dados
    * @type {Map <Object, ObjectData}
* /
    var observado,
        / **
* Lista de manipuladores e seus dados
    * @type {Mapa <manipulador, mapa <objeto, manipulador de dados >>}
* /
    manipuladores,

        defaultAcceptList = ["add", "update", "delete", "reconfigure", "setPrototype", "preventExtensions"];

    // Funções para uso interno

    / **
    * Verifica se o argumento é um objeto Array. Polyfills Array.isArray.
    * @function isArray
    objeto * @param {? *}
* @returns {Boolean}
    * /
        var isArray = A.isArray || (function (toString) {
                função de retorno (objeto) {retornar toString.call (objeto) === "[matriz de objeto]"; };
            }) (O.prototype.toString),

            / **
    * Retorna o índice de um item em uma coleção ou -1 se não for encontrado.
                                                                  * Usa o genérico Array.indexOf ou Array.prototype.indexOf, se disponível.
        * @função inArray
        * @param {matriz}
    * @param {*} gire o item a ser procurado
        * @param {Number} [start = 0] Índice para começar a partir de
        * @returns {Number}
        * /
            inArray = A.prototype.indexOf? A.indexOf || função (matriz, pivô, início) {
                return A.prototype.indexOf.call (array, pivot, start);
            }: função (matriz, pivô, início) {
                for (var i = start || 0; i <comprimento da matriz; i ++)
                if (matriz [i] === dinâmica)
                    retornar i;
                retorno -1;
            }

            / **
            * Retorna uma instância de Map ou um objeto parecido com Map é Map is not
            * suportado ou não suporta forEach ()
            * @function createMap
            * @returns {Mapa}
        * /
            createMap = root.Map === _undefined || ! Map.prototype.forEach? function () {
                // Calço leve do mapa. Falta limpar (), entradas (), teclas () e
                // values ​​() (os últimos 3 não são suportados pelo IE11, portanto, não podem ser usados),
                // não lida com o argumento do construtor (como o IE11) e de
                // é claro que ele não suporta ... de.
                // Chrome 31-35 e Firefox 13-24 têm um suporte básico do Map, mas
                // eles não têm forEach (), então sua implementação nativa é ruim para
                // este polyfill. (O Chrome 36 ou superior é compatível com Object.observe.)
                chaves var = [], valores = [];

                Retorna {
                    tamanho: 0,
                        has: function (key) {retorna Array (teclas, tecla)> -1; }
                    get: function (key) {retorna valores [inArray (keys, key)]; }
                    set: function (chave, valor) {
                        var i = inArray (chaves, chave);
                        if (i === -1) {
                            keys.push (chave);
                            values.push (valor);
                            this.size ++;
                        } else values ​​[i] = value;
                    }
                    "delete": função (tecla) {
                        var i = inArray (chaves, chave);
                        se (i> -1) {
                            keys.splice (i, 1);
                            values.splice (i, 1);
                            this.size--;
                        }
                    }
                    forEach: function (retorno de chamada / *, thisObj * /) {
                    for (var i = 0; i <comprimento da chave; i ++)
                    callback.call (argumentos [1], valores [i], chaves [i], isso);
                }
            };
}: function () {retorna novo mapa (); }

/ **
* Calço simples para Object.getOwnPropertyNames quando não está disponível
* Perde verificações no objeto, não use como uma substituição do Object.keys / getOwnPropertyNames
* @function getProps
* @param {Object} objeto
* @returns {String []}
* /
getProps = O.getOwnPropertyNames? (function () {
    var func = O.getOwnPropertyNames;
    tentar {
        argument.callee;
    } captura (e) {
        // O modo estrito é suportado

        // No modo estrito, não podemos acessar "argumentos", "chamador" e
        // propriedades "callee" das funções. Object.getOwnPropertyNames
        // retorna ["protótipo", "comprimento", "nome"] no Firefox; retorna
        // "chamador" e "argumentos" também no Chrome e na Internet
        // Explorer, portanto, esses valores devem ser filtrados.
        var evitar = (func (inArray) .join ("") + ""). substituir (/ protótipo | comprimento | nome / g, ""). fatia (0, -1). divisão ("");
        if (Avoid.length) func = function (objeto) {
            var props = O.getOwnPropertyNames (objeto);
            if (tipo de objeto === "função")
            for (var i = 0, j; i <comprimento; evitar;)
            if ((j = inArray (props, evite [i ++]))> -1)
                props.splice (j, 1);

            adereços de retorno;
        };
    }
    return func;
}) (): função (objeto) {
    // Versão de boca em boca com for ... in (IE8-)
    var props = [], prop, hop;
    if ("hasOwnProperty" no objeto) {
        for (prop no objeto)
        if (object.hasOwnProperty (prop))
            props.push (prop);
    } outro {
        hop = O.hasOwnProperty;
        for (prop no objeto)
        if (hop.call (objeto, prop))
            props.push (prop);
    }

    // Inserindo uma propriedade não enumerável comum de matrizes
    if (isArray (objeto))
        props.push ("comprimento");

    adereços de retorno;
}

/ **
* Retorne o protótipo do objeto ... se definido.
* @function getPrototype
* @param {Object} objeto
* @returns {Object}
* /
getPrototype = O.getPrototypeOf,

/ **
* Retorne o descritor do objeto ... se definido.
* O IE8 suporta um Object.getOwnPropertyDescriptor (DOM) inútil para DOM
* somente nós, portanto defineProperties é verificado.
* @function getDescriptor
* @param {Object} objeto
Propriedade @param {String}
* @returns {Descritor}
* /
getDescriptor = O.defineProperties && O.getOwnPropertyDescriptor,

/ **
* Configura a próxima verificação e entrega da iteração, usando
* requestAnimationFrame ou um polyfill (fechado).
* @função nextFrame
* @param {function} func
* @returns {number}
* /
nextFrame = root.requestAnimationFrame || root.webkitRequestAnimationFrame || (function () {
    var inicial = + nova data,
        last = inicial;
    função de retorno (func) {
        retornar setTimeout (function () {
            func ((last = + new Date) - inicial);
            17);
    };
}) (),

/ **
* Configura a observação de um objeto
* @function doObserve
* @param {Object} objeto
manipulador * @param {Handler}
* @param {String []} [acceptList]
* /
doObserve = function (objeto, manipulador, acceptList) {
    var data = observado.get (objeto);

    if (dados) {
        performPropertyChecks (dados, objeto);
        setHandler (objeto, dados, manipulador, acceptList);
    } outro {
        data = createObjectData (objeto);
        setHandler (objeto, dados, manipulador, acceptList);

        if (tamanho.s observado === 1)
        // Que comece a observação!
        nextFrame (runGlobalLoop);
    }
}

/ **
* Cria os dados iniciais para um objeto observado
* @function createObjectData
* @param {Object} objeto
* /
createObjectData = função (objeto, dados) {
    var props = getProps (objeto),
        valores = [], descs, i = 0,
        data = {
            manipuladores: createMap (),
            frozen: O.isFrozen? O.isFrozen (objeto): false,
            extensível: O. é extensível? O.isExtensible (objeto): true,
            proto: getPrototype && getPrototype (objeto),
            propriedades: adereços,
            valores: valores,
            notifier: retrieveNotifier (objeto, dados)
        };

    if (getDescriptor) {
        descs = data.descriptors = [];
        while (i <props.length) {
            descs [i] = getDescriptor (objeto, adereços [i]);
            valores [i] = objeto [props [i ++]];
        }
    } else while (i <props.length)
        valores [i] = objeto [props [i ++]];

    observado.set (objeto, dados);

    retornar dados;
}

/ **
* Executa verificações básicas de alteração do valor da propriedade em um objeto observado
* @function performPropertyChecks
* dados @param {ObjectData}
* @param {Object} objeto
* @param {String} [exceto] Não entrega as alterações no diretório
* manipuladores que aceitam esse tipo
* /
performPropertyChecks = (function () {
    var updateCheck = getDescriptor? função (objeto, dados, idx, exceto descr) {
        chave var = data.properties [idx],
            valor = objeto [chave],
            ovalue = data.values ​​[idx],
            odesc = data.descriptors [idx];

        if ("value" em descr && (ovalue === value
            ? ovalue === 0 && 1 / ovalue! == 1 / valor
    : ovalue === ovalue || valor === valor)) {
            addChangeRecord (objeto, dados, {
                nome: chave,
                tipo: "atualização",
                objeto: objeto,
                oldValue: ovalue
            }, exceto);
            data.values ​​[idx] = valor;
        }
        if (odesc.configurable && (! descr.configurable
            || descr.writable! == odesc.writable
        || descr.enumerable! == odesc.enumerable
        || descr.get! == odesc.get
        || descr.set! == odesc.set)) {
            addChangeRecord (objeto, dados, {
                nome: chave,
                tipo: "reconfigurar",
                objeto: objeto,
                oldValue: ovalue
            }, exceto);
            data.descriptors [idx] = descr;
        }
    }: função (objeto, dados, idx, exceto) {
        chave var = data.properties [idx],
            valor = objeto [chave],
            ovalue = dados.valores [idx];

        if (ovalue === valor? ovalue === 0 && 1 / ovalue! == 1 / valor
            : ovalue === ovalue || valor === valor) {
            addChangeRecord (objeto, dados, {
                nome: chave,
                tipo: "atualização",
                objeto: objeto,
                oldValue: ovalue
            }, exceto);
            data.values ​​[idx] = valor;
        }
    };

    // Verifica se alguma propriedade foi excluída
    var deletionCheck = getDescriptor? função (objeto, adereços, proplen, dados, exceto) {
        var i = props.length, descr;
        while (proplen && i--) {
        if (props [i]! == null) {
            descr = getDescriptor (objeto, adereços [i]);
            proplen--;

            // Se não houver descritor, a propriedade realmente
            // foi excluído; caso contrário, foi reconfigurado para
            // isso não é mais enumerável
            if (descr) updateCheck (objeto, dados, i, exceto descr);
            outro {
                addChangeRecord (objeto, dados, {
                    nome: adereços [i],
                    tipo: "excluir",
                    objeto: objeto,
                    oldValue: data.values ​​[i]
            }, exceto);
                data.properties.splice (i, 1);
                data.values.splice (i, 1);
                data.descriptors.splice (i, 1);
            }
        }
    }
}: função (objeto, adereços, proplen, dados, exceto) {
        var i = props.length;
        while (proplen && i--)
            if (props [i]! == null) {
            addChangeRecord (objeto, dados, {
                nome: adereços [i],
                tipo: "excluir",
                objeto: objeto,
                oldValue: data.values ​​[i]
        }, exceto);
            data.properties.splice (i, 1);
            data.values.splice (i, 1);
            proplen--;
        }
    };

    função de retorno (dados, objeto, exceto) {
        if (! data.handlers.size || data.frozen) return;

        var adereços, proplen, chaves,
            valores = dados.valores,
            descs = data.descriptors,
            i = 0, idx,
            valor chave,
            proto, descr;

        // Se o objeto não for extensível, não precisamos verificar se há novos
        // ou propriedades excluídas
        if (data.extensible) {

            props = data.properties.slice ();
            proplen = props.length;
            chaves = getProps (objeto);

            if (descs) {
                while (i <comprimento da chave) {
                    chave = chaves [i ++];
                    idx = inArray (adereços, chave);
                    descr = getDescriptor (objeto, chave);

                    if (idx === -1) {
                        addChangeRecord (objeto, dados, {
                            nome: chave,
                            tipo: "adicionar",
                            objeto: objeto
                        }, exceto);
                        data.properties.push (chave);
                        values.push (objeto [chave]);
                        descs.push (descr);
                    } outro {
                        props [idx] = nulo;
                        proplen--;
                        updateCheck (objeto, dados, idx, exceto descr);
                    }
                }
                deletionCheck (objeto, adereços, proplen, dados, exceto);

                if (! O.isExtensible (object)) {
                    data.extensible = false;
                    addChangeRecord (objeto, dados, {
                        tipo: "preventExtensions",
                        objeto: objeto
                    }, exceto);

                    data.frozen = O.isFrozen (objeto);
                }
            } outro {
                while (i <comprimento da chave) {
                    chave = chaves [i ++];
                    idx = inArray (adereços, chave);
                    valor = objeto [chave];

                    if (idx === -1) {
                        addChangeRecord (objeto, dados, {
                            nome: chave,
                            tipo: "adicionar",
                            objeto: objeto
                        }, exceto);
                        data.properties.push (chave);
                        values.push (valor);
                    } outro {
                        props [idx] = nulo;
                        proplen--;
                        updateCheck (objeto, dados, idx, exceto);
                    }
                }
                deletionCheck (objeto, adereços, proplen, dados, exceto);
            }

        } senão se (! data.frozen) {

            // Se o objeto não é extensível, mas não congelado, apenas temos
            // para verificar alterações de valor
            for (; i <props.length; i ++) {
                chave = adereços [i];
                updateCheck (objeto, dados, i, exceto getDescriptor (objeto, chave));
            }

            if (O.isFrozen (objeto))
                data.frozen = true;
        }

        if (getPrototype) {
            proto = getPrototype (objeto);
            if (proto! == data.proto) {
                addChangeRecord (objeto, dados, {
                    tipo: "setPrototype",
                    nome: "__proto__",
                    objeto: objeto,
                    oldValue: data.proto
                });
                data.proto = proto;
            }
        }
    };
}) (),

/ **
* Configura o loop principal para observação de objetos e notificação de alterações
* Para se nenhum objeto for observado.
                            * @function runGlobalLoop
                            * /
                            runGlobalLoop = function () {
    if (tamanho.s observado) {
        observado.paraCada (performPropertyChecks);
        handlers.forEach (deliverHandlerRecords);
        nextFrame (runGlobalLoop);
    }
}

    / **
    * Entregue os registros de alterações relativos a um determinado manipulador e redefina
* a lista de registros.
* @param {HandlerData} hdata
manipulador * @param {Handler}
* /
deliverHandlerRecords = function (hdata, manipulador) {
    registros var = hdata.changeRecords;
    if (records.length) {
        hdata.changeRecords = [];
        manipulador (registros);
    }
}

/ **
* Retorna o notificador para um objeto - observado ou não
* @function retrieveNotifier
* @param {Object} objeto
* @param {ObjectData} [dados]
* @returns {Notificador}
* /
retrieveNotifier = função (objeto, dados) {
    if (argument.length <2)
        data = observado.get (objeto);

    / ** @type {Notificador} * /
    retornar dados && data.notifier || {
    / **
    * @method notify
    * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype._notify
        * @memberof Notifier
    * @param {ChangeRecord} changeRecord
    * /
    notify: function (changeRecord) {
        changeRecord.type; // Apenas para verificar se a propriedade existe ...

        // Se não houver dados, o objeto não foi observado
        var data = observado.get (objeto);
        if (dados) {
            var recordCopy = {objeto: objeto}, prop;
            for (prop em changeRecord)
            if (prop! == "objeto")
            recordCopy [prop] = changeRecord [prop];
            addChangeRecord (objeto, dados, recordCopy);
        }
    }

    / **
    * @method performChange
    * @see http://arv.github.io/ecmascript-object-observe/#notifierprototype_.performchange
        * @memberof Notifier
    * @param {String} changeType
    * @param {Executor} func O executador de tarefas
    * @param {*} [thisObj] Usado para definir `this` ao chamar func
    * /
    performChange: function (changeType, func / *, thisObj * /) {
    if (typeof changeType! == "string")
    lançar novo TypeError ("changeType não-string inválido");

    if (typeof func! == "function")
    lança novo TypeError ("Não é possível executar a não função");

    // Se não houver dados, o objeto não foi observado
    var data = observado.get (objeto),
        prop, changeRecord,
        thisObj = argumentos [2],
        resultado = thisObj === _ não definido? func (): func.call (thisObj);

    data && performPropertyChecks (dados, objeto, changeType);

    // Se não houver dados, o objeto não foi observado
    if (data && result && typeof result === "objeto") {
        changeRecord = {objeto: objeto, digite: changeType};
        for (prop no resultado)
        if (prop! == "objeto" && prop! == "tipo")
        changeRecord [prop] = resultado [prop];
        addChangeRecord (objeto, dados, changeRecord);
    }
}
};
}

/ **
* Registre (ou redefina) um manipulador na coleção para um determinado
* objeto e um determinado tipo aceita lista.
* @function setHandler
* @param {Object} objeto
* dados @param {ObjectData}
manipulador * @param {Handler}
* @param {String []} acceptList
* /
setHandler = função (objeto, dados, manipulador, acceptList) {
    var hdata = manipuladores.get (manipulador);
    if (! hdata)
        handlers.set (manipulador, hdata = {
            observado: createMap (),
            changeRecords: []
        });
    hdata.observed.set (objeto, {
        acceptList: acceptList.slice (),
        data: data
    });
    data.handlers.set (manipulador, hdata);
}

/ **
* Adiciona um registro de alteração em um determinado ObjectData
* @function addChangeRecord
* @param {Object} objeto
* dados @param {ObjectData}
* @param {ChangeRecord} changeRecord
* @param {String} [exceto]
* /
addChangeRecord = função (objeto, dados, changeRecord, exceto) {
    data.handlers.forEach (function (hdata) {
        var acceptList = hdata.observed.get (objeto) .acceptList;
        // Se except for definido, Notifier.performChange foi
        // chamado, com exceto como o tipo.
        // Todos os manipuladores que aceitam esse tipo são ignorados.
        if ((typeof exceto! == "string"
        || inArray (acceptList, exceto) === -1)
    && inArray (acceptList, changeRecord.type)> -1)
        hdata.changeRecords.push (changeRecord);
    });
};

observado = createMap ();
manipuladores = createMap ();

/ **
* @function Object.observe
* @see http://arv.github.io/ecmascript-object-observe/#Object.observe
    * @param {Object} objeto
manipulador * @param {Handler}
* @param {String []} [acceptList]
* @throws {TypeError}
* @returns {Object} O objeto observado
* /
O.observe = função observe (objeto, manipulador, acceptList) {
    if (! objeto || tipo de objeto! == "objeto" && tipo de objeto! == "função")
    throw new TypeError ("Object.observe não pode observar não-objeto");

    if (tipo de manipulador! == "function")
    throw new TypeError ("Object.observe não pode ser entregue para não funcionar");

    if (O.isFrozen && O.isFrozen (manipulador))
        throw new TypeError ("Object.observe não pode entregar em um objeto de função congelada");

    if (acceptList === _undefined)
        acceptList = defaultAcceptList;
    Caso contrário, if (! acceptList || typeof acceptList! == "object")
    throw new TypeError ("O terceiro argumento para Object.observe deve ser uma matriz de cadeias de caracteres.");

    doObserve (objeto, manipulador, acceptList);

    retornar objeto;
};

/ **
* @function Object.unobserve
* @see http://arv.github.io/ecmascript-object-observe/#Object.unobserve
    * @param {Object} objeto
manipulador * @param {Handler}
* @throws {TypeError}
* @returns {Object} O objeto fornecido
* /
O.unobserve = função não observada (objeto, manipulador) {
    if (objeto === null || tipo de objeto! == "objeto" && tipo de objeto! == "função")
    throw new TypeError ("Object.unobserve não pode desobservar não-objeto");

    if (tipo de manipulador! == "function")
    throw new TypeError ("Object.unobserve não pode ser entregue para não funcionar");

    var hdata = manipuladores.get (manipulador), odata;

    if (hdata && (odata = hdata.observed.get (objeto))) {
        hdata.observed.forEach (função (odata, objeto) {
            performPropertyChecks (odata.data, objeto);
        });
        nextFrame (function () {
            deliverHandlerRecords (hdata, manipulador);
        });

        // No Firefox 13-18, tamanho é uma função, mas createMap deve cair
        // de volta ao calço para essas versões
        if (hdata.observed.size === 1 && hdata.observed.has (objeto))
            manipuladores ["delete"] (manipulador);
        mais hdata.observed ["delete"] (objeto);

        if (odata.data.handlers.size === 1)
            observado ["delete"] (objeto);
        else odata.data.handlers ["delete"] (manipulador);
    }

    retornar objeto;
};

/ **
* @function Object.getNotifier
* @see http://arv.github.io/ecmascript-object-observe/#GetNotifier
    * @param {Object} objeto
* @throws {TypeError}
* @returns {Notificador}
* /
O.getNotifier = função getNotifier (objeto) {
    if (objeto === null || tipo de objeto! == "objeto" && tipo de objeto! == "função")
    throw new TypeError ("Object.getNotifier não pode getNotifier não-objeto");

    if (O.isFrozen && O.isFrozen (objeto)) retorna nulo;

    retornar retrieveNotifier (objeto);
};

/ **
* @function Object.deliverChangeRecords
* @see http://arv.github.io/ecmascript-object-observe/#Object.deliverChangeRecords
    * @see http://arv.github.io/ecmascript-object-observe/#DeliverChangeRecords
manipulador * @param {Handler}
* @throws {TypeError}
* /
O.deliverChangeRecords = função deliverChangeRecords (manipulador) {
    if (tipo de manipulador! == "function")
    throw new TypeError ("Object.deliverChangeRecords não pode ser entregue para não funcionar");

    var hdata = manipuladores.get (manipulador);
    if (hdata) {
        hdata.observed.forEach (função (odata, objeto) {
            performPropertyChecks (odata.data, objeto);
        });
        deliverHandlerRecords (hdata, manipulador);
    }
};

}) (Object, Array, this);