#!/usr/bin/env node

//copied from the script in april2023

//The map ready for testing
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=285304653
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=285304653
//delete the first (header) line

//list of properties
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit#gid=1518541776

let ssFilename = "spreadsheet.tsv"
let cmFileName = "conceptmap.json"

//the url that indicates the type of comparison perfromed when evaluating the 'dependsOn' element. If absent, this is assumed to be = (must be the same)
let comparisonOperationUrl = "http://canshare.co.nz/fhir/StructureDefinition/do-operator"      

//the values for 'no value specified. 
let noValueSystem = "http://canshare.co.nz/fhir/NamingSystem/cs"
let noValueValue = "0"

let fs = require('fs')
let raw = fs.readFileSync(`./${ssFilename}`).toString()

let arLines = raw.split('\r\n')

//remove the first 2 lines
arLines.splice(0,2)

console.log(arLines.length)


let snomed = "http://snomed.info/sct"

let cm = {resourceType:"ConceptMap",id:"canshare-scripted-mar2024"}
cm.url = "http://canshare.co.nz/fhir/ConceptMap/canshare-scripted-mar2024"
cm.identifier = {value:"canshare-scripted-mar2024",system:"http://canshare.co.nz/fhir/NamingSystem/conceptmaps"}
cm.title = "March2024 ConceptMap"
cm.status = "draft"
let group = {source:snomed,target:snomed,element:[]}
cm.group = [group]

//each line in the file refers to a specific target for a specific source, with a unique set of dependencies
//a single source (eg cancer stream) may have multiple lines (targets), so need to analyse the file first, aggregaring by source
//each 
let ctr = 3   //the line counter from the SpreadSheetlines
let hashSource = {}     //hashed by source code - ie the thing we are looking for



for (const lne of arLines) {
    let ar = lne.split('\t')
    ar[0] = ctr++       //replace the sct release with the line number from the ss for debugging. don't think the sct release is needed (if it is later, then make it an object)
    let sourceCode = ar[1].trim()      //B the code of the thing that is being looked for (eg cancer stream, concer substream)
    let sourceDisplay = ar[2]   //C the display for that code

    //console.log(ctr++,sourceCode)

    //add the line to the hash. Each line represents a possible target (value) with any associated dependencies
    hashSource[sourceCode] = hashSource[sourceCode] || {display:sourceDisplay,lines:[]}
    hashSource[sourceCode].lines.push(ar)
}





//now we can iterate through the hashed sources (each of which represents possibly multiple lines)
//each source is in a separate element inside the single group - as it's all snomed of the same version
for (const key of Object.keys(hashSource)) {
    //console.log(key)
    let item = hashSource[key]  //for a given source (ie property) all the rows in the spreadsheet that refer to that property
    //console.log(item)

    //the element that corresponds to this source. eg Cancer stream
    let element = {code:key,display:item.display,target:[]}
    let arLines = item.lines       //these are the lines. each line is a potential target within the element with dependencies

    //now iterate over the lines creating the individual targets. each line becomes 1 target
    // ie the value of the thing I'm looking for (eg cancer stream) is the target - if the dependencies match
    arLines.forEach(function(ar){
        //note that the first 3 cols are used when creating the hash. We don't need them here...
        //let ar = lne.split('\t')


        //create a set of named vars for simplicity
        //let sourceCode = ar[1]      //B the code that is being looked for (eg treatment intent. same as the hash key actually
        //let sourceDisplay = ar[2]   //C the display for that code

        let lineNumber = ar[0]          //the line in the spreadsheet where this target is defined
        let targetType = ar[3]      //D set to 'Value set' if the target is a ValueSet and 'Value' if a value



        let targetValueSetName = ar[4]      // E valueset name if targetType is 'Value Set' (was targetRefsetId - refsetid)

        let targetConceptId = ar[5]     //F conceptId if we're just referring to a single concept
        let targetConceptDisplay = ar[6]    //G concept display if targetType is 'Value'



        //let targetVSName = ar[4]      // F canshare name of the valueset

        let dep0Property = ar[10]    //K the propertyname for the first dependency
        let dep0Op = ar[11]          //L the operator - '=' must match, '^' means test concept in set
        let dep0Value = ar[12]       //M the actual code value of the dependency
        let dep0Display = ar[13]   //N the name of the dependency


        let dep1Property = ar[14]    //O the propertyname for the first dependency
        let dep1Op = ar[15]          //P the operator - '=' must match, '^' means test concept in set
        let dep1Value = ar[16]       //Q the actual code value of the dependency
        let dep1Display = ar[17]   //R the name of the dependency

        let dep2Property = ar[18]    //S the propertyname for the secone dependency
        let dep2Op = ar[19]          //T the operator - '=' must match, '^' means test concept in set
        let dep2Value = ar[20]       //U the actual code value of the dependency
        let dep2Display = ar[21]   //V the name of the dependency



        //console.log(ar)

        //create the target defined by the line. This could be a ValueSet or a single concept - one or the other
                
        let targetCode  //the code of the target - will be a valuesetname or a concept
        let targetDisplay 
        if (targetValueSetName) {
            //there is a valueset defined
            targetCode = `https://nzhts.digital.health.nz/fhir/ValueSet/${targetValueSetName}`
            targetDisplay = targetValueSetName

        } else if (targetConceptId) {
            targetCode = targetConceptId
            targetDisplay = targetConceptDisplay

            //it's a single concept
        } else {
            console.log(">>>> neither valueset nor concept")
            //todo - what to do?
        }

        let target = {code:targetCode}
        if (targetDisplay) { target.display = targetDisplay}
        target.equivalence = 'relatedto'
        target.comment = lineNumber     //for debugging purposes
        target.dependsOn = []   


        //let target = {code:targetValueSetName,display:targetVSName,equivalence:'relatedto',dependsOn:[]}
        // previouse let target = {code:targetValueSetName,display:targetVSName,equivalence:'relatedto',dependsOn:[]}
        element.target.push(target)     //add the target. ie the value if all the dependencies line up


        if (! dep0Property) {
            //if there are no dependsOn then it will match anything
            //this code is hard coded to cancer server - it should probably be explicit in the ss
         /*  
            let dep = {property:'cancer-service',system:noValueSystem,value:noValueValue,display:"No service specified"}
            target.dependsOn.push(dep)
 */
            let dep1 = {property:'cancer-stream',system:noValueSystem,value:noValueValue,display:"No stream specified"}
            target.dependsOn.push(dep1)
            
        }
    

        if (dep0Property) {
            target.dependsOn.push(getDep(dep0Property,dep0Op,dep0Value,dep0Display))
        }

        if (dep1Property) {
            target.dependsOn.push(getDep(dep1Property,dep1Op,dep1Value,dep1Display))
        }

        if (dep2Property) {
            target.dependsOn.push(getDep(dep2Property,dep2Op,dep2Value,dep2Display))
        }

/*

        console.log('v=',dep1Value)
        if (! dep1Value) {
            //if there's no first dependency, then this is the 'maximal set'
            //create a map that specifies 'no value' 
            //don't do anything right now - not entirely sure what this means

           
        } else {
            //there will be at least one dependedncy from the line

            if (dep1Value) {
                //this is the first dependency
                // - previous version - let dep = {property:'cancer-service',system:snomed,value:dep1Value,display:dep1Display}
                let dep = {}
                dep.property = dep1Property //the dependency name - what we need to check
                dep.system = snomed     //always
                dep.value = dep1Value.trim()
                if (dep1Display) {
                    dep.display = dep1Display
                }
                

                //the 
                
                //let dep = {property:dep1Property,system:snomed,value:dep1Value,display:dep1Display}
                target.dependsOn.push(dep)
            }

            if (dep2Value) {
                //this is the second dependency
                // - previous version - let dep = {property:'cancer-service',system:snomed,value:dep1Value,display:dep1Display}
                let dep = {}
                dep.property = dep2Property //the dependency name - what we need to check
                dep.system = snomed     //always
                dep.value = dep2Value.trim()
                if (dep2Display) {
                    dep.display = dep2Display
                }
                

                //the 
                
                //let dep = {property:dep1Property,system:snomed,value:dep1Value,display:dep1Display}
                target.dependsOn.push(dep)
            }

        }

        */

        
    })

    //add the e
    group.element.push(element)

  // console.log(JSON.stringify(element,null,2))
   //break
}

fs.writeFileSync(`./${cmFileName}`,JSON.stringify(cm,null,2))


function getDep(property, operation, value, display) {
    let dep = {}
    dep.property = property
    dep.value = value
    dep.system = snomed
    if (display) {
        dep.display = display
    }
   
    //if the operation is the 'contained in', then add an extension
    if (operation == '^') {
        dep.extension = [{url:comparisonOperationUrl,valueCode:"in-vs"}]
        dep.value =  `https://nzhts.digital.health.nz/fhir/ValueSet/${value}`


    }
    return dep

}

//console.log(JSON.stringify(cm,null,2))