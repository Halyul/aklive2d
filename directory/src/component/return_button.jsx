import './return_button.css'

export default function ReturnButton(props) {

  return (
    <>
      <section className='return-button'
        onClick={() => props.onClick()}
      >
        <section className='bar-wrapper'>
          <section className='bar-arrow-left'></section>
          <section className='bar'></section>
          <section className='bar-arrow-right'></section>
        </section>
        <section className='bar-wrapper'>
          <section className='bar-arrow-left'></section>
          <section className='bar'></section>
          <section className='bar-arrow-right'></section>
        </section>
        <section className='bar-wrapper'>
          <section className='bar-arrow-left'></section>
          <section className='bar'></section>
          <section className='bar-arrow-right'></section>
        </section>
        <section className='bar-wrapper'>
          <section className='bar-arrow-left'></section>
          <section className='bar'></section>
          <section className='bar-arrow-right'></section>
        </section>
      </section>
    </>
  )
}