#!/usr/bin/env node

const fs = require('fs');
const axios = require('axios')


const clientSecret = "965jNRvSMhX0skvZtYWLcGweiktZ6xpy"
const clientId = "canshare"

async function getAccessToken() {

    url = "https://authenticate.nzhts.digital.health.nz/auth/realms/nzhts/protocol/openid-connect/token"
   
    let body =`grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}`
    
    try {
        let result = await axios.post(url,body)
        //console.log(result.data['access_token'])
        return result.data['access_token']
    } catch (ex) {
        console.log(ex)
    }
    

}


//upoad a single file
getAccessToken().then(async function(at) {

    let cm = JSON.parse(fs.readFileSync('./conceptMaps/manual/tnm-vs.json').toString())
    let qry = `https://authoring.nzhts.digital.health.nz/fhir/ConceptMap/${cm.id}` 
            console.log(qry)
    let config = {headers:{authorization:'Bearer ' + at}}
    config['Content-Type'] = "application/fhir+json"

    try {
        await axios.put(qry,cm,config)
    } catch (ex) {
        console.log(ex.response.data)
    }

    console.log(cm)

})



return

//upload all contents of a bundle
getAccessToken().then(
    async function(at) {
        let bundle = JSON.parse(fs.readFileSync('./valuesets/bundle.json').toString())
        console.log(bundle)

        let config = {headers:{authorization:'Bearer ' + at}}
        config['Content-Type'] = "application/fhir+json"


        for (const entry of bundle.entry) {
        //bundle.entry.forEach(entry => {
            console.log(entry.resource.id)
            let vs = entry.resource

            let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/${vs.id}` 
            console.log(qry)

            let content=JSON.stringify(vs)
            //console.log(config)
            try {
                await axios.put(qry,vs,config)
            } catch (ex) {
                console.log(ex.response.data)
            }

/*
            axios.put(qry,content,config).then(function(data) {
                console.log(data.data)
            }
            ).catch(function(ex) {
                //console.log(ex.code)
                console.log(ex.response.status)
                console.log(ex.response.data)
            })

*/

        };
    }
)



return


async function uploadSingleFile(resource,config){
    let qry = `https://authoring.nzhts.digital.health.nz/fhir/${resource.resourceType}/${resource.id}` 
    console.log(qry)
    let content=JDON.parse(resource)
    axios.put(qry,content,config).then(function(data) {
        console.log(data.data)
    }
    ).catch(function(ex) {
        //console.log(ex.code)
        console.log(ex.response.status)
        console.log(ex.response.data)
    })
}

//these are individual tests

getAccessToken().then(
    function(at) {
        console.log('at= ' + at)

        let config = {headers:{authorization:'Bearer ' + at}}
        config['content-type'] = "application/fhir+json"
/*
        //expand a snomed refset
        let qry = "https://authoring.nzhts.digital.health.nz/fhir/ValueSet/$expand?url=http://snomed.info/sct?fhir_vs=refset/471000210108"

        axios.get(qry,config).then(function(data) {
                console.log(data.data)
            }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })
   
        */

        let vsId = "canshare-data-absent-reason"
        let vsUrl = "https://nzhts.digital.health.nz/fhir/ValueSet/canshare-data-absent-reason"

        
        //retrieve a VS by ID
/*
        
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/${vsId}` 
        console.log(qry)

        axios.get(qry,config).then(function(data) {
            console.log(data.data)
        }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })

        */

        if (false) {
        //retrieve by url
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet?url=https://test.nzhts.digital.health.nz/fhir/ValueSet/canshare-data-absent-reason` 
        console.log(qry)

        axios.get(qry,config).then(function(data) {
            console.log(data.data)
        }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })

    }

        
    //expand by url
    if (false) {
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/$expand?url=${vsUrl}` 
        console.log(qry)

        axios.get(qry,config).then(function(data) {
            console.log(data.data)
            console.log(JSON.stringify(data.data))
        }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })
    }
    
    //upload bundle
    if (true) {
        let content = JSON.parse(fs.readFileSync("./valuesets/bundle.json").toString())
        console.log(content)
    
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/` 
        console.log(qry)
    
        axios.post(qry,content,config).then(function(data) {
            console.log(JSON.stringify(data.data))
        }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })
    
    }


    //upload single file
    if (false) {
        let content = JSON.parse(fs.readFileSync("./vs-data-absent-reason.json").toString())
        console.log(content)
    
        let qry = `https://authoring.nzhts.digital.health.nz/fhir/ValueSet/${vsId}` 
        console.log(qry)
    
        axios.put(qry,content,config).then(function(data) {
            console.log(data.data)
        }
        ).catch(function(ex) {
            //console.log(ex.code)
            console.log(ex.response.status)
            console.log(ex.response.data)
        })
    
    }
    
    
    })

    

//---------


async function makeQuery() {
    let token = await getAccessToken()
    console.log('token = ' + token)
}

//getAccessToken()

