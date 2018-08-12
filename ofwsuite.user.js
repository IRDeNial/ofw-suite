// ==UserScript==
// @name         OFW Suite
// @namespace    ofw-suite/main
// @version      0.1
// @description  A suite of tools created to make using OurFamilyWizard easier.
// @author       You
// @match        https://ofw.ourfamilywizard.com/ofw/*
// @grant        GM.setValue
// @grant        GM.getValue
// @grant        GM.addStyle
// @grant        GM.getResourceText
// @resource     bootstrapCSS https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css
//
// @downloadURL  https://gitlab.com/notmike101/ofw-suite/raw/master/ofwsuite.user.js
// @updateURL    https://gitlab.com/notmike101/ofw-suite/raw/master/ofwsuite.meta.js
// ==/UserScript==

(function() {
    'use strict';

    const dev = true;

    let userSettings = {
        enableToneMeter: true,
    };

    const ofwSuitePrefix = 'ofwsuite';

    async function getUserSettings() {
        const storedUserSettings = await GM.getValue('userSettings');
        Object.assign(userSettings,storedUserSettings);
    };
    async function saveUserSettings() {
        await GM.setValue('userSettings',userSettings);
        await getUserSettings();
    }
    
    function setElementStyles(target,styles) {
        Object.assign(target.style, styles);
    };

    async function addStylesheet(name) {
        const newStyle = document.createElement('style');
        const styleContent = await GM.getResourceText('bootstrapCSS');
        newStyle.textContent = styleContent;

        document.head.appendChild(newStyle);
    }
    
    function addStyles() {
        const newStyle = document.createElement('style');
        newStyle.id = `${ofwSuitePrefix}-style`;
        newStyle.textContent = `
            #${ofwSuitePrefix}-settings {
                width: 500px;
                min-height: 500px;
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translateX(-50%) translateY(-50%);
                background-color: #fefefe;
                border: 1px solid #4072B6;
                border-radius: 5px;
                box-shadow: 1px 1px 5px #000000;
                z-index: 1001;
            }

            #${ofwSuitePrefix}-headerNav {
                cursor: pointer;
            }

            #${ofwSuitePrefix}-settings.hidden {
                display: none;
            }

            #${ofwSuitePrefix}-settings .settings-header {
                padding: 10px;
                -moz-border-radius: 2px 2px 0 0;
                -webkit-border-radius: 2px 2px 0 0;
                border-radius: 2px 2px 0 0;
                background-color: #F6F6F6;
                border-bottom: 1px solid #666666;
                border-bottom: 1px solid rgba(0, 0, 0, 0.25);
                border-top: 1px solid #666666;
                border-top: 1px solid rgba(0, 0, 0, 0.25);
                line-height: 1.5em;
                margin-top: -1px;
            }

            #${ofwSuitePrefix}-settings .settings-header h3 {
                font-size: 16px;
                font-weight: 700;
                margin-bottom: 0;
                color: #333333;
            }

            #${ofwSuitePrefix}-settings .settings-header .close {
                cursor: pointer;
                position: absolute;
                top: 0;
                right: 5px;
                width: 15px;
                height: 40px;
                font-weight: bold;
                transform: scale(1.3,1);
                line-height: 40px;
                vertical-align: middle;
            }

            #${ofwSuitePrefix}-settings .settings-content {
                padding: 10px;
                -moz-border-radius: 2px 2px 0 0;
                -webkit-border-radius: 2px 2px 0 0;
                border-radius: 2px 2px 0 0;
                border-bottom: 1px solid #666666;
                border-bottom: 1px solid rgba(0, 0, 0, 0.25);
                border-top: 1px solid #666666;
                border-top: 1px solid rgba(0, 0, 0, 0.25);
                line-height: 1.5em;
                margin-top: -1px;
            }

            #${ofwSuitePrefix}-settings-background {
                position: fixed;
                top: 0;
                left: 0;
                height: 100vh;
                width: 100%;
                display: block;
                background-color: rgba(0,0,0,0.5);
                z-index: 1000;
            }

            #${ofwSuitePrefix}-settings .settings-content .section-title {
                font-weight: 700;
                font-size: 14px;
                line-height: 21px;
                margin-bottom: 0;
                color: #333333;
            }

            #${ofwSuitePrefix}-settings .settings-content label {
                width: auto !important;
                display: block;
                float: left;
                font-weight: 600;
                margin-right: 10px;
                text-align: right;
                width: 49%;
                line-height: 25px;            
            }
            
            #${ofwSuitePrefix}-settings .settings-content input {
                line-height: 25px;
                vertical-align: middle;
                text-align: right;
                width: auto;
            }
            #${ofwSuitePrefix}-settings .settings-content input[type="checkbox"] {
                height: 22px;
            }
        `;

        document.head.appendChild(newStyle);
    };

    function toneMeter() {
        const path = '/ofw/messageboard/popup/compose.form'
        const targetFrame = top.frames[0];

        if(document.location.pathname !== path) return;
        if(userSettings.enableToneMeter) {
            targetFrame.toneCheckEnabled = true;
            targetFrame.hasSeenToneCheckPopup = false;
            targetFrame.showToneLink = false;
            targetFrame.setToneCheckState(true);
            document.getElementById('tc-settingswhatis').style.display = 'none';
        } else {
            targetFrame.toneCheckEnabled = false;
            targetFrame.hasSeenToneCheckPopup = false;
            targetFrame.showToneLink = false;
            targetFrame.setToneCheckState(false);
            document.getElementById('tc-settingswhatis').style.display = 'true';
        }
    };

    function addToolToHeader() {
        const workarea = document.getElementById('headerActions');
        if(!workarea) return;

        const newHeaderItem = document.createElement('li');
        newHeaderItem.id = `${ofwSuitePrefix}-headerNav`;
        newHeaderItem.innerHTML = '<a>OFW Suite</a>';
        newHeaderItem.addEventListener('click',(e) => {
            document.getElementById(`${ofwSuitePrefix}-settings`).classList.remove('hidden');
            
            const settingsBackdrop = document.createElement('div');
            settingsBackdrop.id = `${ofwSuitePrefix}-settings-background`;
            document.body.appendChild(settingsBackdrop);
        });
        workarea.appendChild(newHeaderItem);
    };

    function buildSettingsOverlay() {
        let suiteOverlay = null;
        const doesSuiteOverlayExist = document.querySelector(`#${ofwSuitePrefix}-settings`) ? true : false;
        if(doesSuiteOverlayExist) {
            suiteOverlay = document.querySelector(`#${ofwSuitePrefix}-settings`);
        } else {
            suiteOverlay = document.createElement('div');
            suiteOverlay.id = `${ofwSuitePrefix}-settings`;
            suiteOverlay.classList.add('hidden');
        }
        suiteOverlay.innerHTML = `
            <div class="container">
                <div class="col-12 settings-header">
                    <h3>OFW Suite</h3>
                    <div class="close" id="${ofwSuitePrefix}-settings-close">X</div>
                </div>
                <div class="settings-content">
                    <h4 class="section-title">General Configuration</h4>
                    <div>
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" ${userSettings.enableToneMeter ? 'checked="checked"' : ''}" value="${userSettings.enableToneMeter ? '1' : '0'}" id="${ofwSuitePrefix}-enableToneMeter">
                            <label class="form-check-label" for="${ofwSuitePrefix}-enableToneMeter">Enable Tone Meter</label>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        if(!doesSuiteOverlayExist) document.body.appendChild(suiteOverlay);

        configurationSettingHooks();
    };

    function configurationSettingHooks() {
        const enableToneMeterCheck = document.getElementById(`${ofwSuitePrefix}-enableToneMeter`);
        enableToneMeterCheck.addEventListener('change',(e) => {
            userSettings.enableToneMeter = e.target.checked;
            saveUserSettings();
        });

        const closeButton = document.getElementById(`${ofwSuitePrefix}-settings-close`);
        closeButton.addEventListener('click', (e) => {
            document.getElementById(`${ofwSuitePrefix}-settings`).classList.add('hidden');
            
            const settingsBackdrop = document.querySelector(`#${ofwSuitePrefix}-settings-background`);
            settingsBackdrop.parentNode.removeChild(settingsBackdrop);
        });
    };

    function ready(callback) {
        if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    ready(async () => {
        //addStylesheet('bootstrapCSS');
        await getUserSettings();
        addStyles();
        await addToolToHeader();
        buildSettingsOverlay();

        // Tools
        toneMeter();
    });
})();