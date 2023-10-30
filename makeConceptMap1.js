#!/usr/bin/env node

// still in development...

//generate the conceptmaps from the spreadsheet
//https://docs.google.com/spreadsheets/d/1S-08cA1m-CAy8humztO0S5Djr_wtXibmNn6w4_uFCIE/edit?pli=1#gid=285304653
let fs = require('fs')


//add a line to the CM
async function process1Line(lne,cm){
    let ar = lne.split('\t')
    let targetCode = ar[1]      //the code that is being looked for (eg treatment indent
    let targetDisplay = ar[2]   //the displa

    let targetType = ar[3]      //set to 'Value set' if the target is a ValueSet and so needs
    let targetVSName = ar[4]      // canshare name of the valueset

    let dep1Code = ar[5]    //the code for the first dependency
    let dep1Name = ar[6]        //set to 'cancer service'
    let dep1Op = ar[7]          //the operator - set to '=
    let dep1Value = ar[8]       //the actual code value of the dependency
    let dep1ValueName = ar[9]   //the name of the dependency


    let dep2Code = ar[10]    //the code for the second dependency
    let dep2Name = ar[11]        //set to 'cancer service'
    let dep2Op = ar[12]          //the operator - set to '=
    let dep2Value = ar[13]       //the actual code value of the dependency
    let dep2ValueName = ar[14]   //the name of the dependency



    if (targetVSName) {
        let url = `https://nzhts.digital.health.nz/fhir/ValueSet/${targetVSName}`

        let qry = `ValueSet/$expand?url=${url}&_summary=false&displayLanguage=en-x-sctlang-23162100-0210105`


        let encodedQry = encodeURIComponent(qry)
        $scope.showWaiting = true
        $http.get(`nzhts?qry=${encodedQry}`).then(
            function (data) {
                let expandedVS = data.data  //the contents of this will all be added as targets in the CM


                //now retrieve the canshare id for the refset from the 


                //have a single group, with a single element and all targets under that (atm)

                //first, create the 'dependsOn' entries. these will be the same for all entries.
                //there may be no dependsOn - in which case all values are always returned
                let arDO = []
                if (dep1Value) {
                    let dep = {property:'cancer-service'}   //todo - should this be in the SS - or a SNOMED code
                    dep.system = "http://snomed.info/sct"
                    dep.value = dep1Value
                    dep.display = dep1ValueName
                    arDO.push(dep)
                }

                if (dep2Value) {
                    let dep = {property:'cancer-stream'}   //todo - should this be in the SS - or a SNOMED code
                    dep.system = "http://snomed.info/sct"
                    dep.value = dep2Value
                    dep.display = dep2ValueName
                    arDO.push(dep)
                }

                //now we can create the targets...

                let arTargets = []
                expandedVS.expansion.contains.forEach(function (concept) {
                    let target = {code:concept.code,display:concept.display}
                    target.equivalence = "relatedto"
                    if (arDO.length > 0) {
                        target.dependsOn = arDO
                    }
                    arTargets.push(target)

                })

                //now, finally, we can add the source and targets to the group
                let group = {}
                group.source =  "http://snomed.info/sct"
                group.target =  "http://snomed.info/sct"
                group.element = []

                let element = {}
                element.code = targetCode
                element.display = targetDisplay
                element.target = arTargets
                group.element.push(element)

                cm.group.push(group)
                // deferred.resolve(cm)



            }, function (err) {
                console.log(err)
                // deferred.reject()

            }
        )


        //return deferred.promise
    } else {
        //this is not a valueset. what to do?
    }
}




//load the codesystem def files
let cmDefinitions = fs.readFileSync("./ssTNM.tsv").toString()
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