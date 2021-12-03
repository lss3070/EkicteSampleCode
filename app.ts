
import { Dialog,chromium,webkit,firefox } from 'playwright';

interface MailGetOutput{
    state:boolean
    error?:string
    link?:string
}

interface IVideoLinkPosition{
    tr:number;
    td:number;
}
interface IVideoMainInput{
    newPage:any;
    context:any;
}
interface IVideoCycleInput{
    newPage:any;
    context:any;
    frame:any;
}

interface IVideoCycleOutput{
    state:boolean;
    viewPage?:any;
}

const token =
  'xoxb-2492418043186-2494021131381-yx86rgo5NrTTMijPC5QSOGGO';
const signingSecret='d9801eb3e4b0f6e95122d84274a3703f'

const appToken =
  'xapp-1-A02E694U4KZ-2521230333536-b05a79389abfc1680ffc7cd2959ad02e737257032b228d42a0c7cda6b99af820';



// app.message('nomard',async ({message,say,event,payload})=>{
//     await say('접속중...');

//     const result = await doing();
//     result.state? await say(result.link!) : await say(result.error!);
// });

// (async () => {
//     await app.start();
  
//     console.log('> Slack Server started...');
// })();
  


const mainLogin = async ()=>{
    try{
        //
        // const browser = await chromium.launch({
        //     headless:false,
        //     args: ["--disable-dev-shm-usage"]
        // });
        const browser = await webkit.launch({
            headless:false,
            // args: ["headless","--no-sandbox", "--disable-dev-shm-usage"]
        });
        const context = await browser.newContext();
        const page = await context.newPage();
        const navigationPromise = page.waitForNavigation({
            waitUntil: "networkidle",
        });
        await page.setDefaultNavigationTimeout(0);
        await page.goto(
            "https://ekicte.or.kr/"
        );
        await navigationPromise;

        //popup delete
        const popclose = await page.$$(".pop-close");
        popclose.map(async (el:any) =>{
            // console.log(await el.isVisible())
            if(await el.isVisible()){
                await el.click()
            }
        })
        await page.waitForTimeout(1000);
       
        //로그인
        await page.waitForSelector('input[accesskey="L"]');
        await page.type('input[accesskey="L"]', "genie3217");
        await page.waitForSelector('#loginForm > input[name="loginPwd"]');
        await page.type('#loginForm > input[name="loginPwd"]', "wlsgml249@");
        await page.click('#loginForm > button[title="로그인"]');
        
        // await page.evalute(`window.confirm = () => true`)
        //
        console.log('로그인완료!');

        //alert창 무조건 확인
        page.on('dialog',(dialog:Dialog)=>{
            dialog.accept()
        });
        //나의 강의실 클릭
        await page.waitForTimeout(2000);
        await page.waitForSelector('nav > .wrap > ul.site-gnb > li:nth-child(3)');
        await page.click('nav > .wrap > ul.site-gnb > li:nth-child(3)');
        console.log('나의 강의실 클릭 완료');
        //
        await page.waitForTimeout(3000);


        const trIndex = await page.evaluate(()=>{
            const tbody = document.querySelector('#listForm > .list-type > table > tbody:last-child');

            let index=1;
            for(let item of tbody?.children as any){
                if(item.children.length>0){
                    console.log(index)
                    console.log(item.children[4].innerHTML.replace('%',''));
                    if(item.children[4].innerHTML.replace('%','')!=='100'){
                        return index
                    }
                }
                index++;
            }
        })

        //학습현황란에 학습창 클릭
        const [newPage] = await Promise.all([
            context.waitForEvent('page'),
            page.click(`#listForm > .list-type > table > tbody:last-child > tr:nth-child(3) > td:nth-child(7) > a`)
        ]);

        console.log('학습창 클릭완료');

        await videoMainPage({newPage,context});

        return null;

    }catch(error){
        console.log(error);
    }
};


const videoMainPage=async({newPage,context}:IVideoMainInput)=>{
    await newPage.waitForTimeout(1000);

    let frame = await (await newPage.$('iframe')).contentFrame();

    await frame.waitForSelector('#listForm > .learn-info > a');
    await frame.click('#listForm > .learn-info > a');
    //

    await frame.waitForTimeout(3000);

    //
    await newPage.waitForLoadState();
    newPage.exposeFunction('fnCmdEduStartLessonAuth',async(e:any)=>{
        newPage.evaluate(`document.getElementById('learningFrame').contentWindow.fnCmdEduStart(${e})`)
    });
    //
    let ableCycle=false;
     ableCycle=await frame.evaluate(()=>{

        const dataTable = document.querySelector('#dataTable > tbody');
        for(let tr of dataTable?.childNodes as any){
            const percentTd = tr.childNodes[tr.childNodes.length-3];
            if(percentTd!==undefined){
                if(percentTd.innerHTML==="100%"){
                    return true
                }
            }
        }
        });
        console.log('ableCycle');
        console.log(ableCycle);
            console.log('사이클 내부 실행!');
            const result = await videoCycle({newPage,context,frame});
            console.log('result');
            console.log(result);
            if(result&&result?.state){
                console.log('in!!');
                result.viewPage.close();
                console.log('videoCycleStart');
                await newPage.reload({ waitUntil: "domcontentloaded" });

                await newPage.waitForTimeout(1000);
                //  iframe 선택후.. 학습시작 선택
                frame = await (await newPage.$('iframe')).contentFrame();
        
                await frame.waitForSelector('#listForm > .learn-info > a');
                await frame.click('#listForm > .learn-info > a');

                await frame.waitForTimeout(3000);
                
                console.log('ablecycle 값변경');
                    ableCycle=await frame.evaluate(()=>{

                    const dataTable = document.querySelector('#dataTable > tbody');
                    for(let tr of dataTable?.childNodes as any){
                        const percentTd = tr.childNodes[tr.childNodes.length-3];
                        if(percentTd!==undefined){
                            if(percentTd.innerHTML==="100%"){
                                return true
                            }
                        }
                    }
                    });
                console.log(ableCycle);
            }else{
                ableCycle=false;
            }
}


const videoCycle=async ({newPage,context,frame}:IVideoCycleInput):Promise<IVideoCycleOutput|undefined>=>{
try{
   
    console.log('사이클시작!');
    const videoPosition:IVideoLinkPosition =await frame.evaluate(()=>{
        const dataTable = document.querySelector('#dataTable > tbody');
        let index=0;
        for(let tr of dataTable?.childNodes as any){
            const percentTd = tr.childNodes[tr.childNodes.length-3];
            if(percentTd!==undefined){
                if(percentTd.innerHTML!=="100%"){
                    const videoLink = tr.childNodes[tr.childNodes.length-1];
                    return{
                        tr:(+index)+1,
                        td:(+tr.childNodes.length-1)
                    }
                }
                index++
            }
        }
        });
        console.log('videoPosition');

        const [videoPage] = await Promise.all([
            context.waitForEvent('page'),
            frame.click(`#dataTable > tbody > tr:nth-child(${videoPosition.tr}) > td:nth-child(${videoPosition.td}) > a`)
        ]);
        console.log('videoPage')

        await videoPage.waitForLoadState();
        await videoPage.on('dialog',(dialog:Dialog)=>{

            if(dialog.type()==='alert'&& dialog.message()==="학습창을 닫은(학습종료버튼클릭) 후 목차에서 다음 강의를 열어주시기 바랍니다."){
                console.log('6/6종료');
                videoPage.close();
                newPage.reload();
                videoMainPage({newPage,context});
                console.log('#learningFrame > #detailForm > .contents-wrap > .btn_test-wrap > .btn_finish')
                // return{
                //     state:true,
                //     videoPage
                // }
            }else{
                dialog.accept();
            }
            //학습창을 닫은(학습종료버튼클릭) 후 목차에서 다음 강의를 열어주시기 바랍니다.
        })

        console.log('videoPage wait')
        await videoPage.waitForTimeout(5000);
        await videoPage.on('load',async()=>{
            await videoPage.evaluate(`
            const oxlist = document.getElementById('learningFrame').contentWindow.document.getElementsByClassName('ox');
            if(oxlist.length>0){
                oxlist[0].click();
                oxlist[1].click();
                document.getElementById('learningFrame').contentWindow.document.getElementById('cylearnNext').click();
            }else{
                document.getElementById('learningFrame').contentWindow.document.getElementById('cylearnNext').click();
            }`
            )
        });
        return{
            state:false
        }
}catch(error){
    console.log('errorhappen!');
    console.log(error);
}  
}

mainLogin();
// nomardLogin();


//https://githubmemory.com/repo/microsoft/playwright-python/issues/796 m1 이슈 때문에 docker 작업안됨