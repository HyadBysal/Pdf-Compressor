import checkBox from "../assets/icons/check-box.svg";
import checkMark from "../assets/icons/check-mark.svg";
import { FAQS } from "../data/content.js";

export default function Faq() {
  return (
    <section className="faq-section">
      <h2 className="section-title">FAQ Questions</h2>
      <div className="faq-list">
        {FAQS.map((faq) => (
          <div className="faq-item" key={faq.question}>
            <div className="faq-item__question">
              <span className="faq-item__check">
                <img src={checkBox} alt="" style={{ width: 14.5, height: 14.5 }} />
                <img src={checkMark} alt="" style={{ width: 9.413, height: 7.055 }} />
              </span>
              <span>{faq.question}</span>
            </div>
            <p className="faq-item__answer">{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
