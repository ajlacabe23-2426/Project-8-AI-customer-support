import Home from '../page';

export const metadata={
  title:'Project 8 · Private Beta Preview',
  description:'Illustrative, non-production preview of the Project 8 AI customer support product.',
  robots:{index:false,follow:false,nocache:true}
};

export default function PreviewPage(){
  return <>
    <div style={{
      position:'relative',
      zIndex:10,
      padding:'10px 18px',
      background:'#c7ef9d',
      color:'#162019',
      fontSize:11,
      fontWeight:800,
      letterSpacing:'.08em',
      textAlign:'center'
    }}>
      PRIVATE BETA PREVIEW · ILLUSTRATIVE PRODUCT SURFACE · NO CUSTOMER DATA
    </div>
    <Home/>
  </>;
}
