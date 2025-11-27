/**
 * Configuraci.n Navegaci.n y localStorage
 */
function beforeUnloadHandler(event) {
    event.preventDefault()
    event.returnValue = "Seguro que quieres abandonar este sitio?"

    return "Seguro que quieres abandonar este sitio?"
}
function addBeforeUnloadListener() {
    window.addEventListener("beforeunload", beforeUnloadHandler)
}
function removeBeforeUnloadListener() {
    window.removeEventListener("beforeunload", beforeUnloadHandler)
}
function asset(file) {
    return `/${(file ? file : "")}`
}
function reload(redir) {
    window.location = asset((redir ? redir : ""))
}


/**
 * Manejo de eventos online y offline
 */
function sincronizarOffline() {
}
function validateOnline() {
    disableAll()

    const xhr = (XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHttp"))
    xhr.onload = function () {
        const elements = document.querySelectorAll(".while-waiting")
        elements.forEach(function (el, index) {
            el.removeAttribute("disabled")
            el.classList.remove("disabled")
        })
        sincronizarOffline()
    }
    xhr.onerror = disableAll
    xhr.open("GET", PINGURL, true)
    xhr.send()
}

window.addEventListener("online", function (event) {
    toast("Se reestableci&oacute; la conexi&oacute;n")
    validateOnline()
})
window.addEventListener("offline", function (event) {
    toast("Se perdi&oacute; la conexi&oacute;n")
    validateOnline()
})


/**
 * Configuraci.n Service Worker
 */
function regAll(fun) {
    if ("serviceWorker" in navigator) {
        console.log("info")
        console.info("Compatible con serviceWorker.")

        regWorker(fun)
    }

    if ("PushManager" in window) {
        console.log("info")
        console.info("Compatible con PushManager.")

        // regSyncNotifications()
        // regPeriodicSyncNotifications()
    }
}
async function regWorker(fun) {
    navigator.serviceWorker.register("pwa-sw.js").then(function (reg) {
        if (typeof fun == "function") {
            fun()
        }

        if (!("sync" in reg)) {
            console.log("error")
            console.error("Error registering background sync")

            syncNotifications(reg)
        }

        console.log("info")
        console.info("Yey!", reg)

        navigator.serviceWorker.addEventListener("message", function (event) {
            const data = event.data
            const subject = data.subject
            const message = data.message
            if (subject == "installationProgress") {
                const length = message.length
                const x = parseInt(message.x) + 1

                const porcentaje = x / length * 100

                $("#appSplashTextoProgreso").html(`${x} de ${length} archivo(s) ${porcentaje.toFixed(2)} %`)
            }
        })

        const installingWorker = reg.installing

        if (installingWorker) {
            addBeforeUnloadListener()

            $("#appSplash").show()

            installingWorker.addEventListener("statechange", function () {
                const state = installingWorker.state
                if (state == "installed") {
                    removeBeforeUnloadListener()

                    $("#appSplash").hide()
                }
            })
        }
    })
}
async function regSyncNotifications() {
    navigator.serviceWorker.ready.then(function (reg) {
        if ("sync" in reg) {
            reg.sync.register(SYNCEVENTNAME)
                .then(function () {
                    console.log("info")
                    console.info("Registered background sync")
                })
                .catch(function (err) {
                    console.log("error")
                    console.error("Error registering background sync", err)

                    syncNotifications(reg)
                })
        }
    })
}
async function regPeriodicSyncNotifications() {
    navigator.serviceWorker.ready.then(function (reg) {
        if ("periodicSync" in reg) {
            navigator.permissions.query({
                name: "periodic-background-sync"
            }).then(function (status) {
                console.log("info")

                if (status.state === "granted") {
                    console.info("Periodic background sync can be used.")

                    reg.periodicSync.register(PERIODICSYNCEVENTNAME, {
                        minInterval: 24 * 60 * 60 * 1000
                    })
                        .then(function () {
                            console.log("info")
                            console.info("Registered periodic background sync")
                        })
                        .catch(function (err) {
                            console.log("error")
                            console.error("Periodic background sync cannot be used.", err)
                        })
                }
                else {
                    console.info("Periodic background sync cannot be used.")
                }
            })
        }
    })
}
function syncNotifications(reg) { }
function periodicSyncNotifications(reg) { }
async function unregWorker(redir, /** fun */) {
    if (!("serviceWorker" in navigator)) {
        console.log("info")
        console.info("Sin soporte a serviceWorker.")

        return
    }

    navigator.serviceWorker.ready
        .then(function (reg) {
            reg.unregister()
            if ("periodicSync" in reg) {
                reg.periodicSync.unregister(PERIODICSYNCEVENTNAME)
            }

            caches.delete(PRECACHENAME)
                .then(function () {
                    if (typeof fun == "function") {
                        // No soportado en celular el cacheado sin recargar.
                        // regAll(fun)
                        // return
                    }

                    reload(redir)
                })
                .catch(function (err) {
                    console.log("error")
                    console.error("Boo!", err)
                })
        })
        .catch(function (err) {
            console.log("error")
            console.error("Boo!", err)
        })
}
function reinstall(redir) {
    if (redir) {
    }

    unregWorker(redir, /** function () {
        // cacheado sin recargar.
        frmProducto.reset()
        cargarProductos("json")
        cargarProductos("html.tr")
    } */ )
}

regAll()


/**
 * APP
 */
function remoteAsset(file) {
    // Para peticiones http se requiere el plugin advanced http request
    // local (intranet)
    return `http://localhost/practicas/jwt/${file ? file : ""}`
    // return `http://192.168.1.70/practicas/jwt/${file ? file : ""}`

    // tunnel
    // ngrok
    // return `https://870d-189-159-252-175.ngrok-free.app/practicas/jwt/${file ? file : ""}`
    // cloudflared tunnel --url http://localhost:80
    // return `https://surrey-freeze-matched-now.trycloudflare.com/practicas/jwt/${file ? file : ""}`

    // hosting
    // return `https://domingodesarrollando.com/test/jwt/${file ? file : ""}`
}
function activeMenuOption(href) {
    $("#appMenu .nav-link")
        .removeClass("active")
        .removeAttr('aria-current')

    $(`[href="${(href ? href : "#/")}"]`)
        .addClass("active")
        .attr("aria-current", "page")
}
function disableAll() {
    const elements = document.querySelectorAll(".while-waiting")
    elements.forEach(function (el, index) {
        el.setAttribute("disabled", "true")
        el.classList.add("disabled")
    })
}
function enableAll() {
    const elements = document.querySelectorAll(".while-waiting")
    elements.forEach(function (el, index) {
        el.removeAttribute("disabled")
        el.classList.remove("disabled")
    })
}
function debounce(fun, delay) {
    let timer
    return function (...args) {
        clearTimeout(timer)
        timer = setTimeout(function () {
            fun.apply(this, args)
        }, delay)
    }
}


const PRECACHENAME = "flask2-precache-v1"
const SYNCEVENTNAME = "flask2-sync-notifications"
const PERIODICSYNCEVENTNAME = "flask2-periodic-sync-notifications"
const PINGURL = "ping"


const DateTime = luxon.DateTime
let lxFechaHora
let diffMs = 0
const configFechaHora = {
    locale: "es",
    weekNumbers: true,
    // enableTime: true,
    minuteIncrement: 15,
    altInput: true,
    altFormat: "d/F/Y",
    dateFormat: "Y-m-d",
    // time_24hr: false
}

const app = angular.module("angularjsApp", ["ngRoute"])

app.config(function ($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("")

    $routeProvider
        .when("/", {
            templateUrl: "login",
            controller: "loginCtrl"
        })
        .when("/encuestas", {
            templateUrl: "encuestas",
            controller: "encuestasCtrl"
        })
        .when("/encuesta/:id", {
            templateUrl: "encuesta",
            controller: "encuestaCtrl"
        })
        .when("/notificaciones", {
            templateUrl: "notificaciones",
            controller: "notificacionesCtrl"
        })
        .otherwise({
            redirectTo: "/"
        })
})
app.run(["$rootScope", "$location", "$timeout", function ($rootScope, $location, $timeout) {
    $rootScope.slide = ""
    $rootScope.spinnerGrow = false
    $rootScope.sendingRequest = false
    $rootScope.incompleteRequest = false
    $rootScope.completeRequest = false
    $rootScope.login = localStorage.getItem("flask2-login")
    const defaultRouteAuth = "#/encuestas"
    let timesChangesSuccessRoute = 0


    function actualizarFechaHora() {
        lxFechaHora = DateTime.now().plus({
            milliseconds: diffMs
        })

        $rootScope.angularjsHora = lxFechaHora.setLocale("es").toFormat("hh:mm:ss a")
        $timeout(actualizarFechaHora, 500)
    }
    actualizarFechaHora()


    let preferencias = localStorage.getItem("flask2-preferencias")
    try {
        preferencias = (preferencias ? JSON.parse(preferencias) : {})
    }
    catch (error) {
        preferencias = {}
    }
    $rootScope.preferencias = preferencias


    $rootScope.$on("$routeChangeSuccess", function (event, current, previous) {
        setTimeout(function () {
            validateOnline()
        }, 1000 * 1)

        $rootScope.spinnerGrow = false
        const path = current.$$route.originalPath
        $rootScope.path = path


        // AJAX Setup
        $.ajaxSetup({
            beforeSend: function (xhr) {
                // $rootScope.sendingRequest = true
            },
            headers: {
                Authorization: `Bearer ${localStorage.getItem("flask2-JWT")}`
            },
            error: function (error) {
                $rootScope.sendingRequest = false
                $rootScope.incompleteRequest = false
                $rootScope.completeRequest = true

                const status = error.status
                enableAll()

                if (status) {
                    const respuesta = error.responseText
                    console.log("error", respuesta)

                    if (status == 401) {
                        cerrarSesion()
                        return
                    }

                    modal(respuesta, "Error", [
                        { html: "Aceptar", class: "btn btn-lg btn-secondary", defaultButton: true, dismiss: true }
                    ])
                }
                else {
                    toast("Error en la petici&oacute;n.")
                    $rootScope.sendingRequest = false
                    $rootScope.incompleteRequest = true
                    $rootScope.completeRequest = false
                }
            },
            statusCode: {
                200: function (respuesta) {
                    $rootScope.sendingRequest = false
                    $rootScope.incompleteRequest = false
                    $rootScope.completeRequest = true
                },
                401: function (respuesta) {
                    cerrarSesion()
                },
            }
        })

        // solo hacer si se carga una ruta existente que no sea el splash
        if (path.indexOf("splash") == -1) {
            // validar login
            function validarRedireccionamiento() {
                const login = localStorage.getItem("flask2-login")

                if (login) {
                    if (path == "/") {
                        window.location = defaultRouteAuth
                        return
                    }

                    $(".btn-cerrar-sesion").click(function (event) {
                        $.post("cerrarSesion")
                        $timeout(function () {
                            cerrarSesion()
                        }, 500)
                    })
                }
                else if ((path != "/")
                    && (path.indexOf("emailToken") == -1)
                    && (path.indexOf("resetPassToken") == -1)) {
                    window.location = "#/"
                }
            }
            function cerrarSesion() {
                localStorage.removeItem("flask2-JWT")
                localStorage.removeItem("flask2-login")
                localStorage.removeItem("flask2-preferencias")

                localStorage.removeItem("flask2-encuestas")
                localStorage.removeItem("flask2-notificaciones")

                const login = localStorage.getItem("flask2-login")
                let preferencias = localStorage.getItem("flask2-preferencias")

                try {
                    preferencias = (preferencias ? JSON.parse(preferencias) : {})
                }
                catch (error) {
                    preferencias = {}
                }

                $rootScope.redireccionar(login, preferencias)
            }
            $rootScope.redireccionar = function (login, preferencias) {
                $rootScope.login = login
                $rootScope.preferencias = preferencias

                validarRedireccionamiento()
            }
            validarRedireccionamiento()


            // animate.css
            const active = $("#appMenu .nav-link.active").parent().index()
            const click = $(`[href^="#${path}"]`).parent().index()

            if ((active <= 0)
                || (click <= 0)
                || (active == click)) {
                $rootScope.slide = `animate__animated animate__faster animate__${((click == 0) ? "bounceIn" : "fadeIn")}`
            }
            else if (active != click) {
                $rootScope.slide = `animate__animated animate__faster animate__slideIn${((active > click) ? "Left" : "Right")}`
            }


            // swipe
            if (path.indexOf("notificaciones") != -1) {
                $rootScope.leftView = "Encuestas"
                $rootScope.rightView = ""
                $rootScope.leftViewLink = "#/encuestas"
                $rootScope.rightViewLink = ""
            }
            else if (path.indexOf("encuestas") != -1) {
                $rootScope.leftView = ""
                $rootScope.rightView = "Notificaciones"
                $rootScope.leftViewLink = ""
                $rootScope.rightViewLink = "#/notificaciones"
            }
            else {
                $rootScope.leftView = ""
                $rootScope.rightView = ""
                $rootScope.leftViewLink = ""
                $rootScope.rightViewLink = ""
            }

            let offsetX
            let threshold
            let startX = 0
            let startY = 0
            let currentX = 0
            let isDragging = false
            let isScrolling = false
            let moved = false
            let minDrag = 5

            function resetDrag() {
                offsetX = -window.innerWidth
                threshold = window.innerWidth / 4
                $("#appSwipeWrapper").get(0).style.transition = "transform 0s ease"
                $("#appSwipeWrapper").get(0).style.transform = `translateX(${offsetX}px)`
            }
            function startDrag(event) {
                if (isScrolling && isPartiallyVisible($("#appContent").get(0))) {
                    resetDrag()
                }

                isDragging = true
                moved = false
                isScrolling = false

                startX = getX(event)
                startY = getY(event)

                $("#appSwipeWrapper").get(0).style.transition = "none"
                document.body.style.userSelect = "none"
            }
            function onDrag(event) {
                if (!isDragging
                    || $(event.target).parents("table").length
                    || $(event.target).parents("button").length
                    || $(event.target).parents("span").length
                    || (event.target.nodeName == "BUTTON")
                    || (event.target.nodeName == "SPAN")
                    || $(event.target).parents(".plotly-grafica").length
                    || $(event.target).hasClass("plotly-grafica")) {
                    return
                }

                let x = getX(event)
                let y = getY(event)

                let deltaX = x - startX
                let deltaY = y - startY

                if (isScrolling) {
                    if (isPartiallyVisible($("#appContent").get(0))) {
                        resetDrag()
                    }
                    return
                }

                if (!moved) {
                    if (Math.abs(deltaY) > Math.abs(deltaX)) {
                        isScrolling = true
                        return
                    }
                }

                if (Math.abs(deltaX) > minDrag) {
                    moved = true
                }

                currentX = offsetX + deltaX
                $("#appSwipeWrapper").get(0).style.transform = `translateX(${currentX}px)`
                $("#appSwipeWrapper").get(0).style.cursor = "grabbing"

                event.preventDefault()
            }
            function isVisible(element) {
                const rect = element.getBoundingClientRect()
                return rect.left >= 0 && rect.right <= window.innerWidth
            }
            function isPartiallyVisible(element) {
                const rect = element.getBoundingClientRect()
                return rect.right > 0 && rect.left < window.innerWidth
            }
            function endDrag() {
                if (!isDragging) {
                    return
                }
                $("#appSwipeWrapper").get(0).style.cursor = "grab"
                isDragging = false
                document.body.style.userSelect = ""
                if (isScrolling) {
                    if (isPartiallyVisible($("#appContent").get(0))) {
                        resetDrag()
                    }
                    return
                }

                if (!moved) {
                    $("#appSwipeWrapper").get(0).style.transition = "transform 0.3s ease"
                    $("#appSwipeWrapper").get(0).style.transform = `translateX(${offsetX}px)`
                    return
                }

                let delta = currentX - offsetX
                let finalX = offsetX

                let href, visible

                if (delta > threshold && offsetX < 0) {
                    finalX = offsetX + window.innerWidth
                    $("#appContentLeft").css("visibility", "visible")
                    $("#appContentRight").css("visibility", "hidden")
                    href = $("#appContentLeft").children("div").eq(0).attr("data-href")
                    visible = isPartiallyVisible($("#appContentLeft").get(0))
                } else if (delta < -threshold && offsetX > -2 * window.innerWidth) {
                    finalX = offsetX - window.innerWidth
                    $("#appContentLeft").css("visibility", "hidden")
                    $("#appContentRight").css("visibility", "visible")
                    href = $("#appContentRight").children("div").eq(0).attr("data-href")
                    visible = isPartiallyVisible($("#appContentRight").get(0))
                }

                if (href && visible) {
                    resetDrag()
                    $timeout(function () {
                        window.location = href
                    }, 100)
                } else if (!href) {
                    resetDrag()
                    return
                }

                $("#appSwipeWrapper").get(0).style.transition = "transform 0.3s ease"
                $("#appSwipeWrapper").get(0).style.transform = `translateX(${finalX}px)`
                offsetX = finalX
            }
            function getX(event) {
                return event.touches ? event.touches[0].clientX : event.clientX
            }
            function getY(event) {
                return event.touches ? event.touches[0].clientY : event.clientY
            }
            function completeScreen() {
                $(".div-to-complete-screen").css("height", 0)
                const altoHtml = document.documentElement.getBoundingClientRect().height
                const altoVisible = document.documentElement.clientHeight
                $(".div-to-complete-screen").css("height", ((altoHtml < altoVisible)
                    ? (altoVisible - altoHtml)
                    : 0) + (16 * 4))
            }

            $(document).off("mousedown touchstart mousemove touchmove click", "#appSwipeWrapper")

            $(document).on("mousedown", "#appSwipeWrapper", startDrag)
            $(document).on("touchstart", "#appSwipeWrapper", startDrag)
            $(document).on("mousemove", "#appSwipeWrapper", onDrag)
            // $(document).on("touchmove",  "#appSwipeWrapper", onDrag)
            document.querySelector("#appSwipeWrapper").addEventListener("touchmove", onDrag, {
                passive: false
            })
            $(document).on("mouseup", "#appSwipeWrapper", endDrag)
            $(document).on("mouseleave", "#appSwipeWrapper", endDrag)
            $(document).on("touchend", "#appSwipeWrapper", endDrag)
            $(document).on("click", "#appSwipeWrapper", function (event) {
                if (moved) {
                    event.stopImmediatePropagation()
                    event.preventDefault()
                    return false
                }
            })
            $(window).on("resize", function (event) {
                resetDrag()
                completeScreen()
            })

            resetDrag()


            // solo hacer una vez cargada la animación
            $timeout(function () {
                // animate.css
                $rootScope.slide = ""


                // swipe
                completeScreen()


                // solo hacer al cargar la página por primera vez
                if (timesChangesSuccessRoute == 0) {
                    timesChangesSuccessRoute++


                    // JQuery Validate
                    $.extend($.validator.messages, {
                        required: "Llena este campo",
                        number: "Solo números",
                        digits: "Solo números enteros",
                        min: $.validator.format("No valores menores a {0}"),
                        max: $.validator.format("No valores mayores a {0}"),
                        minlength: $.validator.format("Mínimo {0} caracteres"),
                        maxlength: $.validator.format("Máximo {0} caracteres"),
                        rangelength: $.validator.format("Solo {0} caracteres"),
                        equalTo: "El texto de este campo no coincide con el anterior",
                        date: "Ingresa fechas validas",
                        email: "Ingresa un correo electrónico valido"
                    })


                    // gets
                    const startTimeRequest = Date.now()
                    $.get("fechaHora", function (fechaHora) {
                        const endTimeRequest = Date.now()
                        const rtt = endTimeRequest - startTimeRequest
                        const delay = rtt / 2

                        const lxFechaHoraServidor = DateTime.fromFormat(fechaHora, "yyyy-MM-dd hh:mm:ss")
                        // const fecha = lxFechaHoraServidor.toFormat("dd/MM/yyyy hh:mm:ss")
                        const lxLocal = luxon.DateTime.fromMillis(endTimeRequest - delay)

                        diffMs = lxFechaHoraServidor.toMillis() - lxLocal.toMillis()
                    })

                    $.get("preferencias", {
                        token: localStorage.getItem("flask2-fbt")
                    }, function (respuesta) {
                        if (typeof respuesta != "object") {
                            return
                        }

                        console.log("✅ Respuesta recibida:", respuesta)

                        const login = "1"
                        let preferencias = respuesta

                        localStorage.setItem("flask2-login", login)
                        localStorage.setItem("flask2-preferencias", JSON.stringify(preferencias))
                        $rootScope.redireccionar(login, preferencias)
                    })


                    // events
                    $(document).on("click", ".toggle-password", function (event) {
                        const prev = $(this).parent().find("input")

                        if (prev.prop("disabled")) {
                            return
                        }

                        prev.focus()

                        if ("selectionStart" in prev.get(0)) {
                            $timeout(function () {
                                prev.get(0).selectionStart = prev.val().length
                                prev.get(0).selectionEnd = prev.val().length
                            }, 0)
                        }

                        if (prev.attr("type") == "password") {
                            $(this).children().first()
                                .removeClass("bi-eye")
                                .addClass("bi-eye-slash")
                            prev.attr({
                                "type": "text",
                                "autocomplete": "off",
                                "data-autocomplete": prev.attr("autocomplete")
                            })
                            return
                        }

                        $(this).children().first()
                            .addClass("bi-eye")
                            .removeClass("bi-eye-slash")
                        prev.attr({
                            "type": "password",
                            "autocomplete": prev.attr("data-autocomplete")
                        })
                    })
                }
            }, 500)

            activeMenuOption(`#${path}`)
        }
    })
    $rootScope.$on("$routeChangeError", function () {
        $rootScope.spinnerGrow = false
    })
    $rootScope.$on("$routeChangeStart", function (event, next, current) {
        $rootScope.spinnerGrow = true
    })
}])
app.controller("loginCtrl", function ($scope, $http, $rootScope) {
    $("#frmInicioSesion").submit(function (event) {
        event.preventDefault()

        pop(".div-inicio-sesion", 'ℹ️Iniciando sesi&oacute;n, espere un momento...', "primary")

        $.post("iniciarSesion", $(this).serialize(), function (respuesta) {
            enableAll()

            if (respuesta.length) {
                localStorage.setItem("flask2-login", "1")
                localStorage.setItem("flask2-preferencias", JSON.stringify(respuesta[0]))
                $("#frmInicioSesion").get(0).reset()
                location.reload()
                return
            }

            pop(".div-inicio-sesion", "Usuario y/o contrase&ntilde;a incorrecto(s)", "danger")
        })

        disableAll()
    })
})


let timesAccessRouteEncuestas = 0
let lsEncuestas = localStorage.getItem("flask2-encuestas")
let encuestas = (lsEncuestas ? JSON.parse(lsEncuestas) : [])
app.controller("encuestasCtrl", function ($scope, $http, $rootScope) {
    function buscarEncuestas() {
        $rootScope.sendingRequest = true
        $rootScope.incompleteRequest = false
        $rootScope.completeRequest = false

        $.get("encuestas/buscar", {
            busqueda: ""
        }, function (e) {
            localStorage.setItem("flask2-encuestas", JSON.stringify(e))
            encuestas = e
            $scope.encuestas = e

            enableAll()
        })

        disableAll()
    }

    $scope.encuestas = encuestas
    $rootScope.encuesta = {
        index: "",
        id: "",
        cliente: "",
        reparacion: "",
        todoFunciona: "",
        fueRapido: "",
        recomiendaServicio: ""
    }

    if (timesAccessRouteEncuestas == 0) {
        timesAccessRouteEncuestas++

        $(document).on("click", ".btn-editar-encuesta", function (event) {
            const index = parseInt($(this).data("index"))
            const id = $(this).data("id")

            $rootScope.encuesta = encuestas[index]
            $rootScope.encuesta.index = index

            window.location = `#/encuestas/${id}`
        })

        $(document).on("click", ".btn-eliminar-encuesta", function (event) {
            const index = parseInt($(this).data("index"))
            const id = $(this).data("id")

            modal("Quieres eliminar esta encuesta?", "Confirmación", [
                { "html": "Cancelar", "class": "btn btn-lg btn-secondary", dismiss: true },
                {
                    "html": "Eliminar", "class": "btn btn-lg bg-body-tertiary while-waiting", defaultButton: true, fun: function (event) {
                        $.post("encuesta/eliminar", {
                            id: id
                        }, function (respuesta) {
                            enableAll()
                            encuestas.splice(index, 1)
                            localStorage.setItem("flask2-encuestas", JSON.stringify(encuestas))
                            $scope.encuestas = encuestas
                            closeModal()
                        })

                        disableAll()
                    }
                }])
        })

        buscarEncuestas()
    }
})


let timesAccessRouteEncuesta = 0
app.controller("encuestaCtrl", function ($scope, $http, $rootScope, $routeParams) {
    let id = $routeParams.id

    if (!$rootScope.encuesta) {
        $rootScope.encuesta = {
            index: "",
            id: "",
            cliente: "",
            reparacion: "",
            todoFunciona: "",
            fueRapido: "",
            recomiendaServicio: ""
        }
    }

    if (!$rootScope.encuesta.id
        && id
        && !isNaN(id)) {
        disableAll()
        $rootScope.sendingRequest = true
        $.get(`encuesta/${id}`, function (encuestas) {
            enableAll()
            $rootScope.encuesta = encuestas[0]
        })
    }

    $('.nav-link[href="#/encuestas"]').addClass("active")

    if (timesAccessRouteEncuesta == 0) {
        timesAccessRouteEncuesta++

        $(document).on("submit", "#frmEncuesta", function (event) {
            event.preventDefault()

            $.post("encuesta/guardar", $(this).serialize(), function (respuesta) {
                enableAll()

                if (respuesta) {
                    pop(".div-encuesta", "Encuesta guardada con &eacute;xito.", "info")

                    const encuesta = $rootScope.encuesta
                    if (encuestas.length) {
                        if (encuesta.id) {
                            encuestas[encuesta.index] = {
                                index: encuesta.index,
                                id: encuesta.id,
                                cliente: $("#cliente").val(),
                                reparacion: $("#reparacion").val(),
                                todoFunciona: $("#todoFunciona").val(),
                                fueRapido: $("#fueRapido").val(),
                                recomiendaServicio: $("#recomiendaServicio").val()
                            }
                        }
                        else {
                            encuestas.unshift({
                                index: 0,
                                id: respuesta.id,
                                cliente: $("#cliente").val(),
                                reparacion: $("#reparacion").val(),
                                todoFunciona: $("#todoFunciona").val(),
                                fueRapido: $("#fueRapido").val(),
                                recomiendaServicio: $("#recomiendaServicio").val()
                            })
                        }

                        localStorage.setItem("flask2-encuestas", JSON.stringify(encuestas))
                        $scope.encuestas = encuestas
                    }
                }
            })

            disableAll()
        })
    }
})


let timesAccessRouteNotificaciones = 0
let lsNotificaciones = localStorage.getItem("flask2-notificaciones")
let notificaciones = (lsNotificaciones ? JSON.parse(lsNotificaciones) : [])
app.controller("notificacionesCtrl", function ($scope, $http, $rootScope) {
    function cargarNotificaciones() {
        $rootScope.sendingRequest = true
        $rootScope.incompleteRequest = false
        $rootScope.completeRequest = false

        $.get("notificaciones/cargar", function (encuestas) {
            localStorage.setItem("flask2-notificaciones", JSON.stringify(encuestas))
            notificaciones = encuestas
            $scope.encuestas = encuestas

            enableAll()
        })

        disableAll()
    }

    $scope.encuestas = notificaciones

    if (timesAccessRouteNotificaciones == 0) {
        timesAccessRouteNotificaciones++

        cargarNotificaciones()

        $(document).on("click", ".btn-cargar-notificaciones", cargarNotificaciones)
        $(document).on("click", ".btn-eliminar-notificacion", function (event) {
            const button = $(this)
            const id = button.data("id")

            $.post("notificacion/eliminar", { id: id }, function (respuesta) {
                cargarNotificaciones()
            })

            disableAll()
        })
        $(document).on("mouseenter", ".p-leer-notificacion", function (event) {
            const p = $(this)
            const id = p.parent().data("id")

            if (p.parent().hasClass("active")) {
                $.post("notificacion/marcarComoLeida", { id: id }, function (respuesta) {
                    p.parent().removeClass("active")
                    p.addClass("p-leer-notificacion")
                    enableAll()
                })

                disableAll()
            }
        })
    }
})

document.addEventListener("DOMContentLoaded", function (event) {
    setTimeout(function () {
        validateOnline()
    }, 1000 * 1)
    activeMenuOption(location.hash)
})
