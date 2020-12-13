const searchParams = new URLSearchParams(window.location.search);
const glParameters = {
    alpha: false,
    antialias: true,
    premultipliedAlpha: true,
    preserveDrawingBuffer: true
};
const loader = new Loader(
    document.getElementById("loader"),
    document.getElementById("loader-button"),
    document.getElementById("loader-bar-inner"));
const canvas = document.getElementById("renderer");
const gl =
    canvas.getContext("webgl", glParameters) ||
    canvas.getContext("experimental-webgl", glParameters);

/**
 * Called when loading resources failed
 */
const onFailure = () => {
    alert("Failed loading resources");
};

/**
 * Make a language object from a locale code
 * @param {String} locale The locale code
 * @returns {Language} The language object most suitable for this locale
 */
const makeLanguage = locale => {
    switch (locale) {
        default:
        case "en":
            return new Language("language/english.json");
        case "nl":
            return new Language("language/dutch.json");
    }
};

const paramLang = searchParams.get("lang");
const language = paramLang ? makeLanguage(paramLang) : makeLanguage(navigator.language.substring(0, 2));
let imperial = false;

if (gl &&
    gl.getExtension("OES_element_index_uint") &&
    (gl.vao = gl.getExtension("OES_vertex_array_object"))) {
    const audioEngine = new AudioEngine(new Random());
    const audio = new AudioBank(audioEngine);

    language.load(() => {
        imperial = language.get("UNIT_LENGTH") === "ft";

        let session = new Session();
        const tutorial = window["localStorage"].getItem("tutorial") !== null;
        const wrapper = document.getElementById("wrapper");
        const gui = new GUI(document.getElementById("gui"));
        const sessionData = tutorial ? window["localStorage"].getItem("session") : null;
        const systems = new Systems(gl, new Random(session.environmentSeed), wrapper.clientWidth, wrapper.clientHeight);
        let lastDate = null;
        let koi = null;
        let loaded = true;
        let mouseLeft = false;

        canvas.width = wrapper.clientWidth;
        canvas.height = wrapper.clientHeight;

        window.onresize = () => {
            if (canvas.width === wrapper.offsetWidth && canvas.height === wrapper.offsetHeight)
                return;

            canvas.width = wrapper.offsetWidth;
            canvas.height = wrapper.offsetHeight;

            systems.resize(canvas.width, canvas.height);
            gui.resize();

            if (koi)
                koi.resize();
        };

        /**
         * Save the game state to local storage
         */
        const save = () => {
            window["localStorage"].setItem("session", session.serialize(koi, gui).toString());
        };

        /**
         * A function that creates a new game session
         */
        const newSession = () => {
            window["localStorage"].removeItem("tutorial");

            session = new Session();

            koi = session.makeKoi(systems, audio, gui, new TutorialBreeding(gui.overlay));
        };

        // Retrieve last session if it exists
        if (sessionData) {
            try {
                // throw new Error();
                session.deserialize(new BinBuffer(sessionData));

                koi = session.makeKoi(systems, audio, gui, new TutorialCards(gui.overlay));
            } catch (error) {
                gui.clear();

                newSession();

                console.warn(error);
            }
        }
        else
            newSession();

        // Trigger the animation frame loop
        lastDate = new Date();

        const loop = () => {
            if (loaded) {
                const date = new Date();

                koi.render(.001 * (date - lastDate));

                lastDate = date;

                requestAnimationFrame(loop);
            }
        };

        // Auto save
        setInterval(() => {
            if (!document["hidden"])
                save();
        }, 60000);

        canvas.addEventListener("mousedown", event => {
            event.preventDefault();

            koi.touchStart(event.clientX, event.clientY);
        });

        canvas.addEventListener("touchstart", event => {
            event.preventDefault();

            koi.touchStart(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        });

        canvas.addEventListener("mousemove", event => {
            koi.touchMove(event.clientX, event.clientY, mouseLeft);

            mouseLeft = false;
        });

        canvas.addEventListener("touchmove", event => {
            event.preventDefault();

            koi.touchMove(event.changedTouches[0].clientX, event.changedTouches[0].clientY);
        })

        canvas.addEventListener("mouseup", koi.touchEnd.bind(koi));

        canvas.addEventListener("touchend", event => {
            event.preventDefault();

            koi.touchEnd();
        });

        canvas.addEventListener("mouseleave", () => {
            mouseLeft = true;
        });

        window.onbeforeunload = () => {
            gui.cancelAction();
            koi.touchEnd();

            save();

            koi.free();
            systems.free();
            gui.clear();

            loaded = false;
        };

        loader.setFinishCallback(() => {
            requestAnimationFrame(loop);

            audioEngine.interact();
        });
    }, onFailure);

    // Create globally available SVG defs
    new FishIconDefs(
        document.getElementById("fish-icon-defs"),
        new Random(Random.prototype.makeSeed(Koi.prototype.COLOR_BACKGROUND.g)));
}
else
    onFailure();