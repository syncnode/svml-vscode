"use strict";
var fs = require("fs");
var yaml = require("js-yaml");
var plist = require("plist");
function writePlistFile(grammar, fileName) {
    var text = plist.build(grammar);
    fs.writeFileSync(fileName, text, "utf8");
}
function readYaml(fileName) {
    var text = fs.readFileSync(fileName, "utf8");
    return yaml.safeLoad(text);
}
function changeTsToTsx(str) {
    return str.replace(/\.ts/g, '.tsx');
}
function fixGrammarScopeNames(rule) {
    if (typeof rule.name === 'string') {
        rule.name = changeTsToTsx(rule.name);
    }
    for (var property in rule) {
        var value = rule[property];
        if (typeof value === 'object') {
            fixGrammarScopeNames(value);
        }
    }
}
function changeTsToTsxGrammar(grammar) {
    var tsxUpdates = readYaml("../TypeScriptReact.YAML-tmLanguage");
    // Update name, file types, scope name and uuid
    for (var key in tsxUpdates) {
        if (key !== "repository") {
            grammar[key] = tsxUpdates[key];
        }
    }
    // Update scope names to .tsx
    var repository = grammar.repository;
    for (var key in repository) {
        fixGrammarScopeNames(repository[key]);
    }
    // Add repository items
    var updatesRepository = tsxUpdates.repository;
    for (var key in updatesRepository) {
        switch (key) {
            case "expression":
                // Update expression
                repository[key].patterns.unshift(updatesRepository[key].patterns[0]);
                break;
            default:
                // Add jsx 
                repository[key] = updatesRepository[key];
        }
    }
    return grammar;
}
function buildGrammar() {
    var tsGrammar = readYaml("../TypeScript.YAML-tmLanguage");
    // Write TypeScript.tmLanguage
    //writePlistFile(tsGrammar, "../TypeScript.tmLanguage");
    writePlistFile(tsGrammar, "../syntaxes/TypeScript.tmLanguage");
    // Write TypeScriptReact.tmLangauge
    var tsxGrammar = changeTsToTsxGrammar(tsGrammar);
    //writePlistFile(tsxGrammar, "../TypeScriptReact.tmLanguage");
    writePlistFile(tsxGrammar, "../syntaxes/TypeScriptReact.tmLanguage");
}
function changeTsToTsxTheme(theme) {
    var tsxUpdates = readYaml("../TypeScriptReact.YAML-tmTheme");
    // Update name, uuid
    for (var key in tsxUpdates) {
        if (key !== "settings") {
            theme[key] = tsxUpdates[key];
        }
    }
    // Update scope names to .tsx
    var settings = theme.settings;
    for (var i = 0; i < settings.length; i++) {
        settings[i].scope = changeTsToTsx(settings[i].scope);
    }
    // Add additional setting items
    theme.settings = theme.settings.concat(tsxUpdates.settings);
    return theme;
}
function buildTheme() {
    var tsTheme = readYaml("../TypeScript.YAML-tmTheme");
    // Write TypeScript.tmTheme
    writePlistFile(tsTheme, "../syntaxes/TypeScript.tmTheme");
    // Write TypeScriptReact.thTheme
    var tsxTheme = changeTsToTsxTheme(tsTheme);
    writePlistFile(tsxTheme, "../syntaxes/TypeScriptReact.tmTheme");
}
buildGrammar();
buildTheme();
