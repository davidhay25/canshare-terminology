#!/usr/bin/env node

//generate the conceptmaps from the spreadsheet
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=245875863


// now https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/view#gid=285304653
let fs = require('fs')



//load the codesystem def files
let cmDefinitions = fs.readFileSync("./conceptmapdef.tsv").toString()
let arLines = cmDefinitions.split('\n')
let snomed = "http://snomed.info/sct"
// let allConceptMaps = []         //all the Concept maps converted from the spreadsheet
arLines.forEach(function (line,inx) {
    if (inx > 14) {         //skip past header
        let pos = inx + 1   //rows are 1-based

        let cmFileName = `./conceptMaps/cm-${pos}.json`
        let paramFileName = `./conceptMaps/param-${pos}.json`
        let arCm = line.split('\t')         //each array is a single concept map. each element corresponds to a column

        //only if there is a value in the first col (source) and col24 - target...
        if (arCm[0] && arCm[24] && (arCm[24].trim() !== '-')) {

            //parameters
            let params = {resourceType:"Parameters",parameter:[]}


            //the concept map
            let cm = {resourceType:"ConceptMap",status:"draft"}
            cm.id = `canshare-cm-${pos}`
            cm.url = `http://canshare.co.nz/fhir/ConceptMap/${cm.id}`

            //add the CM url as a parameter
            params.parameter.push({name:"url",valueUri:cm.url})
    
            cm.group = []
    
            let group = {}
            group.source = snomed
            group.target = snomed
            group.element = []
    
            cm.group.push(group)
            let element = {}
            element.code = arCm[0]      //the source element- the domain
            element.display = arCm[1]   //the display
            group.element.push(element)
            element.target = []

            //add the source element to the params
            params.parameter.push({name:"coding",valueCoding:{system:snomed,code:element.code}})

            let target = {}
            target.code = arCm[24]      //the target element - what we want to return
            target.display = arCm[25]   //the description of the target
            target.comment = arCm[23]   //whether a value or a valueset
            target.equivalence = "relatedto"
    
            element.target.push(target)
    
            //now add the dependencies (if any)
            if (arCm[4]) {
                //this is the service
                target.dependsOn = target.dependsOn || []
                target.dependsOn.push({property: 'cancer-service', system: snomed, value: arCm[4], display:arCm[3]})
                params.parameter.push(makeDependency('cancer-service',arCm[4]))

            }
    

            if (arCm[7]) {
                //this is the primary cancer
                target.dependsOn = target.dependsOn || []
                target.dependsOn.push({property: 'primary-cancer', system: snomed, value: arCm[7], display:arCm[6]})
                params.parameter.push(makeDependency('primary-cancer',arCm[7]))
            }
    
            if (arCm[19]) {
                //this is the primary location
                target.dependsOn = target.dependsOn || []
                target.dependsOn.push({property: 'primary-location', system: snomed, value: arCm[19], display:arCm[18]})
                params.parameter.push(makeDependency('primary-location',arCm[19]))
            }
    
            if (arCm[22]) {
                //this is the histology
                target.dependsOn = target.dependsOn || []
                target.dependsOn.push({property: 'histology', system: snomed, value: arCm[22], display:arCm[21]})
                params.parameter.push(makeDependency('histology',arCm[22]))
            }
    
    
            fs.writeFileSync(cmFileName,JSON.stringify(cm,null,2))
            fs.writeFileSync(paramFileName,JSON.stringify(params,null,2))
    
        }

    }

    //console.log(allConceptMaps)

    //construct a dependency for the parame element
   


})


function makeDependency(prop,code) {
    //name is the dependency name (eg ancer-service )
    //code is the dependedncy code

    let param = {name:'dependency',part:[]}
    param.part.push({name:'element',valueUri:prop})
    param.part.push({name:'concept',valueCodeableConcept:{coding:[{system:snomed,code:code}]}})

    return param
    
}