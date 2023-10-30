#!/usr/bin/env node

//make a single map
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=245875863


// now https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=285304653

//importing maps that have only 2 properties - cancer-service and cancer-stream

//the values for 'no value specified. 
let noValueSystem = "http://canshare.co.nz/fhir/NamingSystem/cs"
let noValueValue = "none"

let fs = require('fs')
let raw = fs.readFileSync('./conceptMapTNM.tsv').toString()
let arLines = raw.split('\r\n')
console.log(arLines.length)
//console.log(arLines)

let snomed = "http://snomed.info/sct"

let cm = {resourceType:"ConceptMap",id:"canshare-scripted"}
cm.url = "http://canshare.co.nz/fhir/ConceptMap/canshare-scripted"
cm.identifier = {value:"canshare-scripted",system:"http://canshare.co.nz/fhir/NamingSystem/conceptmaps"}
cm.title = "ConceptMap generated from Spreadsheet"
cm.status = "draft"
let group = {source:snomed,target:snomed,element:[]}
cm.group = [group]

//each line in the file refers to a specific target, with a unique set of dependencied
//a single source (eg cT) may have multiple lines (targets), so need to analyse file first, aggregaring by source
let hashSource = {}     //hashed by source code
for (const lne of arLines) {
    let ar = lne.split('\t')
    let sourceCode = ar[1]      //B the code that is being looked for (eg cT)
    let sourceDisplay = ar[2]   //C the display for that code

    hashSource[sourceCode] = hashSource[sourceCode] || {display:sourceDisplay,lines:[]}
    hashSource[sourceCode].lines.push(ar)
}

//now we can iterate through the hashed sources (each of which represents possibly multiple lines)
for (const key of Object.keys(hashSource)) {
    //console.log(key)
    let item = hashSource[key]
    //console.log(item)

    //the element that corresponds to this source
    let element = {code:key,display:item.display,target:[]}
    let arLines = item.lines       //these are the lines. each line is a target within the element

    //now iterate over the lines creating the individual targets. each line becomes 1 target
    arLines.forEach(function(ar){
        //let ar = lne.split('\t')

        //create a set of named vars for simplicity
        let sourceCode = ar[1]      //B the code that is being looked for (eg treatment intent
        let sourceDisplay = ar[2]   //C the display for that code

        let targetType = ar[3]      //D set to 'Value set' if the target is a ValueSet and so needs

        let targetRefsetId = ar[4]      // E refsetid
        let targetVSName = ar[5]      // F canshare name of the valueset

        let dep1Code = ar[6]    //G the code for the first dependency
        let dep1Name = ar[7]        //H set to 'cancer service'
        let dep1Op = ar[8]          //I the operator - set to '=
        let dep1Value = ar[9]       //J the actual code value of the dependency
        let dep1Display = ar[10]   //K the name of the dependency


        let dep2Code = ar[11]    //the code for the second dependency
        let dep2Name = ar[12]        //set to 'cancer stream'
        let dep2Op = ar[13]          //the operator - set to '=
        let dep2Value = ar[14]       //the actual code value of the dependency
        let dep2Display = ar[15]   //the name of the dependency

        //console.log(ar)

        //create the target that represents the line
        let target = {code:targetRefsetId,display:targetVSName,equivalence:'relatedto',dependsOn:[]}
        element.target.push(target)     //add the target

        console.log('v=',dep1Value)
        if (! dep1Value) {
            //if there's no first dependency, then this is the 'maximal set'
            //create a map that specifies 'no value' 
        
            let dep = {property:'cancer-service',system:noValueSystem,value:noValueValue,display:"No service specified"}
            target.dependsOn.push(dep)

            let dep1 = {property:'cancer-stream',system:noValueSystem,value:noValueValue,display:"No stream specified"}
            target.dependsOn.push(dep1)

           
        } else {
            //there will be at least one dependedncy from the line
            if (dep1Value) {
                //this is the first dependency
                //let target = {code:targetRefsetId,display:targetVSName,equivalence:'relatedto',dependsOn:[]}
                let dep = {property:'cancer-service',system:snomed,value:dep1Value,display:dep1Display}
                target.dependsOn.push(dep)
            }
        }

        
    })

    //add the e
    group.element.push(element)

  // console.log(JSON.stringify(element,null,2))
   //break
}

fs.writeFileSync("./canshare-scripted.json",JSON.stringify(cm,null,2))

//console.log(JSON.stringify(cm,null,2))