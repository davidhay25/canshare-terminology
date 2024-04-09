#!/usr/bin/env node

//download all the DG & Comp from the POC site (source) and populate test (target)
//safe to run at any time - overrites any matching test DG/Comp


const readline = require('readline');

const axios = require('axios')

const source = "http://poc.canshare.co.nz"
const target = "http://test.canshare.co.nz"

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("This will update the Canshare test environment from the production environment.")
console.log("It will copy all dataGroups and Compositions across, replacing them if they already exist.")
console.log("It won't remove any (with a different name) that have been directly created there")
console.log()
console.log('Press Enter to continue to <control>C to halt...');

// Wait for user input
rl.question('', () => {
  doUpdate()
  rl.close();
});


async function doUpdate() {


    //-------------  datagroups
    
    if (true) {
        console.log('Downloading DG');
        let qry = `${source}/model/allDG`
    
        let response = await axios.get(qry)
    
        let allDg = response.data //JSON.parse(response.data)
        let config = {headers:{'x-user-email': 'uploadscript.dummy.com'}}
    
        for (const dg of allDg) {
            let updateQry = `${target}/model/DG/${dg.name}`
    
            try {
                console.log(updateQry)
                let response = await axios.put(updateQry,dg,config)
    
    
            } catch(ex) {
            
                if (ex.response) {
                
                    console.log(ex.response.status)
                    console.log(JSON.stringify(ex.response.data,null,2))
                } else {
                    console.log(ex)
                }
    
                      
            }
        
        }
    }
   

    // ------- compositions

    console.log(`Downloading Compositions from ${source}`);
    let qry = `${source}/model/allCompositions`

    let response = await axios.get(qry)

    let allCompositions = response.data //JSON.parse(response.data)
    let config = {headers:{'x-user-email': 'uploadscript.dummy.com'}}

    for (const comp of allCompositions) {
        let updateQry = `${target}/model/comp/${comp.name}`

        try {
            console.log(updateQry)
            let response = await axios.put(updateQry,comp,config)
        } catch(ex) {
    
            if (ex.response) {
            
                console.log(ex.response.status)
                console.log(JSON.stringify(ex.response.data,null,2))
            } else {
                console.log(ex)
            }

                  
        }
    
    }




}
