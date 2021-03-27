let url = "https://www.espncricinfo.com/series/ipl-2020-21-1210595";
let fs = require("fs");
let request = require("request");
let cheerio =  require("cheerio");
let path = require("path");

createDir("ipl 2020");
console.log("before");
request(url,cb);

function cb(error,response,html){
    if(error){
        console.log(error);
    }else{
        extractHtml(html);
    }
}

function extractHtml(html){
    let selTool = cheerio.load(html);
    let link = selTool("a[data-hover='Fixtures and Results']").attr("href");
    let fulllink = "https://www.espncricinfo.com"+link
    console.log(fulllink)
    extractBatsman(fulllink)

}

function extractBatsman(link){
    
    request(link,cb);

    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            extractPlayer(html);
            console.log("------------");
        }
    }

}

function extractPlayer(link){
    let selectorTool = cheerio.load(link);
    let info=[]
    let matchinfolink = selectorTool("a[data-hover='Scorecard']");
    for(let i=0;i<matchinfolink.length;i++){
        let addr = selectorTool(matchinfolink[i]).attr("href")
        let fulladdr = "https://www.espncricinfo.com"+addr
        info.push(fulladdr)
    }
    extractDetails(info,0)
}

function extractDetails(link,idx){
    if(idx==link.length){
        return;
    }
    request(link[idx],cb);

    function cb(error,response,html){
        if(error){
            console.log(error);
        }else{
            extractInfo(html);
            console.log("------------");
            extractDetails(link,idx+1)
        }
    }
}

function extractInfo(link){
    let selectorTool = cheerio.load(link);
    let batsman = selectorTool(".table.batsman");
    let teamnameArr = selectorTool(".Collapsible .header-title.label");
    let matchinfo = selectorTool(".match-info.match-info-MATCH .description").text().trim().split(",");
    let venue=matchinfo[1].trim();
    let date = matchinfo[2].trim();
    let result = selectorTool(".match-info.match-info-MATCH .status-text span").text();
    //console.log(batsman.length)
    for(let i=0;i<batsman.length;i++){
        let teamname =  selectorTool(teamnameArr[i]).text();
        teamname = teamname.split("INNINGS")[0];
        teamname = teamname.trim();
        createsubDir(teamname,"ipl 2020");

        let opponent = selectorTool(teamnameArr[(i+1)%2]).text();
        opponent = opponent.split("INNINGS")[0];
        opponent = opponent.trim();
        
        let batsmansrow = selectorTool(batsman[i]).find("tbody tr")
        
        for(let j=0;j<batsmansrow.length;j++){
            let singleAllcol = selectorTool(batsmansrow[j]).find("td");
            if(singleAllcol.length==8){
                let name = selectorTool(singleAllcol[0]).text();
                createFile(name,teamname,"ipl 2020");
                let runs = selectorTool(singleAllcol[2]).text();
                let balls = selectorTool(singleAllcol[3]).text();
                let four = selectorTool(singleAllcol[5]).text();
                let six = selectorTool(singleAllcol[6]).text();
                let runrate = selectorTool(singleAllcol[7]).text();
                let obj =
                    {
                        teamname:teamname,
                        opponent:opponent,
                        venue:venue,
                        date:date,
                        result:result,
                        name:name,
                        runs:runs,
                        balls:balls,
                        four:four,
                        six:six,
                        runrate:runrate
                    }
                write(name,teamname,"ipl 2020",obj)
            }
        }
        
    }
    
}

function createDir(foldername){
    let folderPath = path.join(__dirname,foldername);
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath)
    }
}

function createsubDir(foldername,root){
    let folderPath = path.join(__dirname,root,foldername);
    if(!fs.existsSync(folderPath)){
        fs.mkdirSync(folderPath)
    }
}

function createFile(batsmanname,name,root){
    let filePath = path.join(__dirname,root,name,batsmanname+".json")
    if(!fs.existsSync(filePath)){
        let  createStream = fs.createWriteStream(filePath);
        createStream.end();
    }
}

function write(batsmanname,teamname,root,obj){
    let filePath = path.join(__dirname,root,teamname,batsmanname+".json");
    fs.appendFileSync(filePath, JSON.stringify(obj)+",");
}

