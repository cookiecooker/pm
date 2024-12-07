import { useState, useRef, useMemo, useEffect } from 'react';
import './App.css';
import { ATTRIBUTE_LIST, CLASS_LIST, SKILL_LIST } from './consts.js';


function App() {
  
  const [ attribute, setAttribute ] = useState(ATTRIBUTE_LIST.reduce((obj, v) => ({ ...obj, [v]: { val: 10, modifier: 0 } }), {}));
  const [ classList, setClasslist] = useState(CLASS_LIST);
  const [ selectedClass, setSelectedClass] = useState('')
  const [ totalAttribute, setTotalAttribute ] = useState(ATTRIBUTE_LIST.length * 10);
  const [ skills, setSkills ] = useState(SKILL_LIST.map(item => ({ ...item, point: 0 })));
  const [ pointCount, setPointCount ] = useState(0);
  const [ dcNumber, setDCNumber ] = useState(0);
  const [ rollNumber, setRollNumber ] = useState(0);
  const [ selectedSkill, setSelectedSkill ] = useState('Acrobatics');
  const [ selectedSkillPoint, setSelectedSkillPoint ] = useState(0);
  const [ result, setResult] = useState('')
  const hightLightClass = useRef(new Set());
  const modifierCount = useRef();

  const getCharacter = async () => {
    const res = await fetch("https://recruiting.verylongdomaintotestwith.ca/api/{cookiecooker}/character", {
      method: "GET",
    });
    const { attribute, skills } = await res.json();
  }

  useEffect(() => {
    if (!modifierCount.current) { // it will run twice for develop mode
      updateModifierCount();
      getCharacter();
    }
    return () => {}
  },[]);

  const updateModifierCount = () => {
    modifierCount.current = new Map();
    for (let item of skills) {
      const count = modifierCount.current.get(item.attributeModifier) || 0;
      modifierCount.current.set(item.attributeModifier, count + 1);
    }
  }

  const totalPoint = useMemo(() => {
    return 10 + 4 * attribute["Intelligence"].modifier
  }, [attribute])

  const renderStatisticsItem = (item, index) => {
    return (
      <li key={index}>
        {item[0]}{":"}{item[1]}
      </li>
    )
  }

  const renderStatistics = (selected) => {
    if (!selected || selected.length === 0) return null;
    const cla = classList[selectedClass];
    return (
      <ul>
        {Object.entries(cla).map(renderStatisticsItem)}
      </ul>
    );
  }

  const renderClassItem = (item, index) => {
    const setClass = () => { setSelectedClass(item) };
    return <li 
            key={index} 
            className={hightLightClass.current.has(item) ? "highlight" : ""} 
            onClick={setClass}>
              {item}
          </li>
  }

  const renderClass = (list) => {
    return (
      <ul>
        {Object.keys(list).map(renderClassItem)}
      </ul>
    )
  }

  const closeStatistics = () => {
    setSelectedClass('');
  }

  const highLightClassList = (newAttribute) => {
    for (let [key, val] of Object.entries(classList)) {
      let hightLightFlag = true;
      for (let [k, v] of Object.entries(val)) {
        if (newAttribute[k].val < v) {
          if (hightLightClass.current.has(key)) hightLightClass.current.delete(key);
          hightLightFlag = false;
          break;
        }
      }
      if (hightLightFlag) {
        if (!hightLightClass.current.has(key)) hightLightClass.current.add(key);
      }
    }
  }

  const renderAttributeItem = (item, index) => {

    const increment = () => {
      if (totalAttribute >= 70) {
        window.alert("All attributes cannot exceed 70");
        return;
      } 

      const modifierPointCount = modifierCount.current.get(item[0]);
      if (modifierPointCount + pointCount > totalPoint) {
        window.alert("Skills point exceed");
        return;
      } else {
        if (modifierPointCount > 0) {
          setPointCount(pointCount + modifierPointCount);
        }
      }

      const newAttribute = { ...attribute };
      newAttribute[item[0]].modifier = attribute[item[0]].modifier + 1;
      if (item[1].val >= 10) {
        setTotalAttribute(totalAttribute + 2)
        newAttribute[item[0]].val = attribute[item[0]].val + 2;
      } else {
        setTotalAttribute(totalAttribute + 1)
        newAttribute[item[0]].val = attribute[item[0]].val + 1;
      }
      
      setAttribute(newAttribute);
      highLightClassList(newAttribute);
    }

    const decrement = () => {

      const modifierPointCount = modifierCount.current.get(item[0]);
      if (modifierPointCount > 0) setPointCount(pointCount - modifierPointCount);

      const newAttribute = { ...attribute };
      newAttribute[item[0]].modifier = attribute[item[0]].modifier - 1;
      if (item[1].val > 10) {
        setTotalAttribute(totalAttribute - 2)
        newAttribute[item[0]].val = attribute[item[0]].val - 2;
      } else {
        setTotalAttribute(totalAttribute - 1)
        newAttribute[item[0]].val = attribute[item[0]].val - 1;
      }
      
      setAttribute(newAttribute);
      highLightClassList(newAttribute);
    }
    return (
      <li key={index}>
        {item[0]}{":"}{item[1].val}{`(Modifier:${item[1].modifier})`}
        <button onClick={increment}>+</button><button onClick={decrement}>-</button>
      </li>
    );
  }

  const renderAttribute = (attr) => {
    return <ul>
      {Object.entries(attr).map(renderAttributeItem)}
    </ul>;
  }

  const renderSkillListItem = (item, index) => {

    const { name, point, attributeModifier } = item;
    const modifier = attribute[attributeModifier].modifier;

    const increment = () => {

      if (pointCount + 1 > totalPoint) {
        window.alert("Skills point exceed");
        return;
      } else {
        setPointCount(pointCount + 1);
      }

      const newSkills = [...skills];
      newSkills[index].point++
      setSkills(newSkills);
    }

    const decrement = () => {
      const newSkills = [...skills];
      newSkills[index].point--;
      setSkills(newSkills);
      setPointCount(pointCount - 1);
    }

    return (
      <li key={index}>
        {name}{": "}{point}{`(Modifier: ${attributeModifier}): ${modifier}`}
        <button onClick={increment}>+</button><button onClick={decrement}>-</button>
        {`total: ${point + modifier}`}
      </li>
    )
  }

  const renderSkillList = (skillList) => {
    return <ul>
      {skillList.map(renderSkillListItem)}
    </ul>;
  }

  const renderOption = (item, index) => {
    return <option value={item.name} key={index}>{item.name}</option>;
  }

  const onNumberChange = (e) => {
    setDCNumber(e.target.value);
  }

  const getOption = (e) => {
    setSelectedSkill(e.target.value);
  }

  const roll = (e) => {
    e.preventDefault();
    const number = Math.trunc(Math.random() * 20);
    setRollNumber(number)
    const skill = skills.filter(item => item.name == selectedSkill)[0];
    const point = skill.point + attribute[skill.attributeModifier].modifier;
    setSelectedSkillPoint(point)
    if (point + number > dcNumber) {
      setResult("Successful")
    } else {
      setResult("Failure")
    }
  }

  const saveCharacter = async () => {
    await fetch("https://recruiting.verylongdomaintotestwith.ca/api/{cookiecooker}/character", {
      method: "POST",
      body: JSON.stringify({ attribute, skills }),
      headers: {
        'content-type': 'application/json'
      },
    });    
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>React Coding Exercise</h1>
        <button onClick={saveCharacter}>Save Character</button>
      </header>
      <section>
        <p>Skill Check</p>
        <form>
          <label htmlFor="skills">Skill:</label>
          <select id="skills" onChange={getOption}>
            {skills.map(renderOption)}
          </select>
          <label htmlFor="dc">DC</label>
          <input onChange={onNumberChange} type="number" min="1" max="20" step="1" id="DC" />
          <button onClick={roll}>Roll</button>
        </form>
        {result && (
          <div>
              <p>Skill: {selectedSkill}: {selectedSkillPoint}</p>
              <p>You Rolled: {rollNumber}</p>
              <p>The DC was: {dcNumber}</p>
              <p>Result: {result}</p>
          </div>
        )}
      </section>
      <section className="App-section">
        <div className="content">
          <p>Attribute</p>
          {renderAttribute(attribute)}
        </div>
        <div className="content">
          {renderClass(classList)}
        </div>
        {selectedClass && 
          <div className="content">
            <p>Minimum Requirement</p>
            {renderStatistics(selectedClass)}
            <button onClick={closeStatistics}>Close</button>
          </div>
        }
        <div className="content">
          <p>Skills</p>
          <p>Total skill points available: {totalPoint}</p>
          {renderSkillList(skills)}
        </div>
      </section>
    </div>
  );
}

export default App;