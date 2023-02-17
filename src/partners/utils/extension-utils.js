const { 
    NODE_VUE, NODE_REACT, PYTHON_REACT, PYTHON_VUE, JAVA_REACT, JAVA_VUE 
} = require('./extension-constant')
const fs = require('fs')
const os = require('os')
const execa = require('execa')
const rimraf = require('rimraf')
const { createDirectory, readFile, writeFile } = require('./file-utlis')
const { replaceContent } = require('./utils')

function validateEmpty(input) {
    return input !== '';
}

function checkForVue(answers) {
    if (
        answers.project_type === NODE_VUE 
        || answers.project_type === JAVA_VUE 
        || answers.project_type === PYTHON_VUE
    ) {
        return true
    }
    return false
}

async function copyTemplateFiles(targetDirectory, answers) {
    try {
        if (!fs.existsSync(targetDirectory)) {
            createDirectory(targetDirectory);
        }
        await execa('git', ['init'], { cwd: targetDirectory });
        await execa('git', ['remote', 'add', 'origin', answers.project_url], { cwd: targetDirectory });
        if (answers.vue_version === 'vue3') {
            await execa('git', ['pull', 'origin', 'main-vue3:main-vue3'], { cwd: targetDirectory });
        } else {
            await execa('git', ['pull', 'origin', 'main:main'], { cwd: targetDirectory });
        }
        rimraf.sync(`${targetDirectory}/.git`); // unmark as git repo
        return true;
    } catch (error) {
        return Promise.reject(error);
    }
}

async function installNpmPackages(targetDir) {
    await execa('npm', ['i'], { cwd: targetDir });
    await execa('npm', ['run', 'build'], { cwd: targetDir });
}

async function installPythonDependencies(targetDir) {
    const os_platform = os.platform()
    if (os_platform === 'darwin' || os_platform === 'linux') {
        await execa('python3', ['-m', 'venv', 'venv'], {cwd: targetDir});
        await execa('./venv/bin/pip', ["install", '-r', 'requirements.txt'], {cwd: targetDir});
    } else if (os_platform === 'win32') {
        await execa('python', ['-m', 'venv', 'venv'], {cwd:targetDir});
        await execa('venv\\Scripts\\pip', ['install', '-r', 'requirements.txt'], {cwd: targetDir});
    }
}

async function installJavaPackages(targetDir) {
    await execa('mvn', ['clean'], {cwd: targetDir});
    await execa('mvn', ['package'], {cwd: targetDir});
}

async function installDependencies(answerObject) {
    project_type = answerObject.project_type
    if (project_type === NODE_VUE || project_type === NODE_REACT) {
        // installing dependencies for Node projects
        await installNpmPackages(answerObject.targetDir);
        } 
    
    else if (project_type === PYTHON_VUE || project_type === PYTHON_REACT ) {
        // installing dependencies for Python projects
        await installNpmPackages(answerObject.targetDir);
        await installPythonDependencies(answerObject.targetDir);
        }

    else if (project_type === JAVA_VUE || project_type === JAVA_REACT) {
        // installing dependencies for java projects
        await installNpmPackages(`${answerObject.targetDir}/app`);
        await installJavaPackages(answerObject.targetDir);
    }
}

async function replaceGrootWithExtensionName(targetDir, answerObject) {
    let readMe = readFile(`${targetDir}/README.md`);
    writeFile(`${targetDir}/README.md`, replaceContent(readMe, 'groot', answerObject.name));

    if (answerObject.project_type === JAVA_VUE || answerObject.project_type === JAVA_REACT) {
        let pomXml = readFile(`${targetDir}/pom.xml`)
        writeFile(`${targetDir}/pom.xml`, replaceContent(pomXml, 'groot', answerObject.name))
        
        targetDir = `${targetDir}/app`
    }

    let packageJson = readFile(`${targetDir}/package.json`);
    writeFile(`${targetDir}/package.json`, replaceContent(packageJson, 'groot', answerObject.name));
}

const PROJECT_REPOS = {
    [NODE_VUE]: "https://github.com/gofynd/example-extension-javascript.git",
    [NODE_REACT]: "https://github.com/gofynd/example-extension-javascript-react.git",
    [PYTHON_VUE]: "https://github.com/gofynd/example-extension-python-vue.git",
    [PYTHON_REACT]: "https://github.com/gofynd/example-extension-python-react.git",
    [JAVA_VUE]: "https://github.com/gofynd/example-extension-java-vue.git",
    [JAVA_REACT]: "https://github.com/gofynd/example-extension-java-react.git",
}


module.exports = {
    validateEmpty,
    checkForVue,
    copyTemplateFiles,
    installDependencies,
    replaceGrootWithExtensionName,
    PROJECT_REPOS
};
