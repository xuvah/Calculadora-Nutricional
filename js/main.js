// =============================================
// CONSTANTES E VARIÁVEIS GLOBAIS
// =============================================
const DOM = {
    sexInput: document.getElementById('sex'),
    ageInput: document.getElementById('age'),
    heightInput: document.getElementById('height'),
    weightInput: document.getElementById('weight'),
    bfInput: document.getElementById('bf'),
    activityInput: document.getElementById('activity'),
    goalInput: document.getElementById('goal'),
    calculateBtn: document.getElementById('calculate-btn'),
    resultSection: document.getElementById('result')
  };

  const ERROR_IDS = {
    age: 'age-error',
    height: 'height-error',
    weight: 'weight-error',
    bf: 'bf-error',
    activity: 'activity-error',
    goal: 'goal-error',
    sex: 'sex-error'
  };
  
  
  let calorieChart, macroChart;
  
  // =============================================
  // INICIALIZAÇÃO
  // =============================================
  document.addEventListener('DOMContentLoaded', () => {
    // Campos numéricos
    DOM.ageInput.addEventListener('input', () => validateField('ageInput'));
    DOM.heightInput.addEventListener('input', () => validateField('heightInput'));
    DOM.weightInput.addEventListener('input', () => validateField('weightInput'));
    DOM.bfInput.addEventListener('input', () => validateField('bfInput'));
    
    // Campos de seleção
    DOM.activityInput.addEventListener('change', updateCalculateButton);
    DOM.goalInput.addEventListener('change', updateCalculateButton);
    DOM.goalInput.addEventListener('change', () => {toggleMonthlyGoal();updateCalculateButton();});
  });
  
  // =============================================
  // FUNÇÕES PRINCIPAIS
  // =============================================
  
  function selectGender(element) {
    // Remove seleção de todas as opções
    document.querySelectorAll('.gender-option').forEach(opt => {
      opt.classList.remove('selected');
    });
    
    // Adiciona seleção à opção clicada
    element.classList.add('selected');
    
    // Atualiza o valor do campo hidden
    DOM.sexInput.value = element.dataset.value;
    
    // Valida o formulário
    // validateField('sexInput');
  }
  
  function validateField(field) {
    const value = DOM[field].value;
    
    switch(field) {
      case 'ageInput':
        const age = parseInt(value);
        showError(ERROR_IDS.age, value && (age < 10 || age > 120));
        break;
        
      case 'heightInput':
        const height = parseInt(value);
        showError(ERROR_IDS.height, value && (height < 100 || height > 250));
        break;
        
      case 'weightInput':
        const weight = parseFloat(value);
        showError(ERROR_IDS.weight, value && (weight < 30 || weight > 300));
        break;
        
      case 'bfInput':
        const bf = parseFloat(value);
        showError(ERROR_IDS.bf, value && (bf < 5 || bf > 60));
        break;
        
      default:
        break;
    }
    
    updateCalculateButton();
  }
  
  function validateAllFields() {
    let isValid = true;
    
    // Validação do sexo
    if (!DOM.sexInput.value) {
      showError(ERROR_IDS.sex, true);
      isValid = false;
    }
    
    // Validação da idade
    const age = parseInt(DOM.ageInput.value);
    if (!DOM.ageInput.value || age < 10 || age > 120) {
      showError(ERROR_IDS.age, true);
      isValid = false;
    }
    
    // Validação da altura
    const height = parseInt(DOM.heightInput.value);
    if (!DOM.heightInput.value || height < 100 || height > 250) {
      showError(ERROR_IDS.height, true);
      isValid = false;
    }
    
    // Validação do peso
    const weight = parseFloat(DOM.weightInput.value);
    if (!DOM.weightInput.value || weight < 30 || weight > 300) {
      showError(ERROR_IDS.weight, true);
      isValid = false;
    }
    
    // Validação do BF (opcional)
    const bf = DOM.bfInput.value;
    if (bf && (parseFloat(bf) < 5 || parseFloat(bf) > 60)) {
      showError(ERROR_IDS.bf, true);
      isValid = false;
    }
    
    // Validação da atividade
    if (!DOM.activityInput.value) {
      showError(ERROR_IDS.activity, true);
      isValid = false;
    }
    
    // Validação do objetivo
    if (!DOM.goalInput.value) {
      showError(ERROR_IDS.goal, true);
      isValid = false;
    }
    
    return isValid;
  }
  
  function updateCalculateButton() {
    // Só verifica campos numéricos para habilitar/desabilitar
    const ageValid = !DOM.ageInput.value || (parseInt(DOM.ageInput.value) >= 10 && parseInt(DOM.ageInput.value) <= 120);
    const heightValid = !DOM.heightInput.value || (parseInt(DOM.heightInput.value) >= 100 && parseInt(DOM.heightInput.value) <= 250);
    const weightValid = !DOM.weightInput.value || (parseFloat(DOM.weightInput.value) >= 30 && parseFloat(DOM.weightInput.value) <= 300);
    const bfValid = !DOM.bfInput.value || (parseFloat(DOM.bfInput.value) >= 5 && parseFloat(DOM.bfInput.value) <= 60);
    
    DOM.calculateBtn.disabled = !(ageValid && heightValid && weightValid && bfValid);
  }

  function calculate() {
    // Valida todos os campos (incluindo os obrigatórios)
    if (!validateAllFields()) {
      // Rolagem até o primeiro erro
      const firstError = document.querySelector('.error-message[style="display: block;"]');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    if (!validateAllFields()) return;
    
    // Obter valores
    const monthlyGoal = parseFloat(document.getElementById('monthly-goal')?.value || 0.5);
    const { sex, age, height, weight } = getInputValues();
    const bf = DOM.bfInput.value ? parseFloat(DOM.bfInput.value) : null;
    const activity = parseFloat(DOM.activityInput.value);
    const goal = DOM.goalInput.value;
    // Cálculos
    const leanMass = bf ? weight * (1 - bf/100): null;
    const tmb = calculateTMB(sex, weight, height, age, leanMass);
    const tdee = calculateTDEE(tmb, activity);
    const { calories, explanation } = calculateCalorieGoal(tdee, goal, monthlyGoal);
    const { protein, fat, carbs } = calculateMacros(weight, calories, goal,bf);
    const { value, classification } = calculateBMI(weight, height);
    
    // Exibir resultados
    displayResults(tmb, tdee, calories, explanation, protein, fat, carbs, value, classification);
    // Destruir gráficos existentes antes de criar novos
    if (calorieChart) {
      calorieChart.destroy();
    }
    if (macroChart) {
        macroChart.destroy();
    }
    // Criar gráficos
    createCharts(tmb, tdee, calories, goal, carbs, protein, fat);
    
    // Mostrar seção de resultados
    DOM.resultSection.style.display = 'block';
    DOM.resultSection.scrollIntoView({ behavior: 'smooth' });
  }
  
  // =============================================
  // FUNÇÕES AUXILIARES
  // =============================================
  
  function getInputValues() {
    return {
      sex: DOM.sexInput.value,
      age: parseInt(DOM.ageInput.value),
      height: parseInt(DOM.heightInput.value),
      weight: parseFloat(DOM.weightInput.value)
    };
  }

    // Adicione esta função para calcular o IMC e classificação
    function calculateBMI(weight, height) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      return {
          value: bmi.toFixed(2),
          classification: getBMIClassification(bmi)
      };
    }
  
  function calculateTMB(sex, weight, height, age, leanMass) {
    if (leanMass) {
      return 284 + 25.9 * leanMass;
    }else{
      return sex === 'male' 
        ? 10 * weight + 6.25 * height - 5 * age + 5
        : 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }
  
  function calculateTDEE(tmb, activity) {
    return tmb * activity;
  }
  
  function calculateCalorieGoal(tdee, goal, monthlyGoal) {
    let calories, explanation;
    
    switch(goal) {
        case 'cut':
            const dailyDeficit = monthlyGoal * 4 * 7700 / 30; // 7700kcal ≈ 1kg de gordura
            calories = tdee - dailyDeficit ;
            explanation = `Déficit de ~${Math.round(dailyDeficit)}kcal/dia para perder ${monthlyGoal}kg/semana`;
            break;
            
        case 'bulk':
            const dailySurplus = monthlyGoal * 7700 / 30; // Aprox. 2000kcal para ganhar 0.5kg de músculo/semana
            calories = tdee + dailySurplus;
            explanation = `Superávit de ~${Math.round(dailySurplus)}kcal/dia para ganhar ${monthlyGoal}kg/semana`;
            break;
            
        default:
            calories = tdee;
            explanation = "Manutenção calórica para manter seu peso atual";
    }
    
    return { calories, explanation };
  }

  function toggleMonthlyGoal() {
    const goal = DOM.goalInput.value;
    const container = document.getElementById('monthly-goal-container');
    
    if (goal === 'cut' || goal === 'bulk') {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
  }
  
  function calculateMacros(weight, calories, goal, bf) {
    let protein;
    
    if (goal === 'cut') {
      protein = weight * 1.8;
    } else {
      protein = weight * 2;
    } 
    
    const fat = goal === 'cut' ? weight * 0.9 
    : (goal === 'bulk' && bf) ? weight *(1+((100-bf)*0.0025)) 
    : weight;
    const carbCalories = calories - (protein * 4) - (fat * 9);
    const carbs = carbCalories / 4;
    
    return {
      protein: Math.round(protein),
      fat: Math.round(fat),
      carbs: Math.round(carbs)
    };
  }



  function getBMIClassification(bmi) {
    if (bmi < 16.0) return 'Baixo peso (Grau 3)';
    if (bmi >= 16.0 && bmi <= 16.9) return 'Baixo peso (Grau 2)';
    if (bmi >= 17.0 && bmi <= 18.49) return 'Baixo peso (Grau 1)';
    if (bmi >= 18.5 && bmi <= 24.9) return 'Eutrofia (Normal)';
    if (bmi >= 25.0 && bmi <= 29.9) return 'Pré-obesidade';
    if (bmi >= 30.0 && bmi <= 34.9) return 'Obesidade (Grau 1)';
    if (bmi >= 35.0 && bmi <= 39.9) return 'Obesidade (Grau 2)';
    return 'Obesidade (Grau 3)';
  }

  function displayResults(tmb, tdee, calories, explanation, protein, fat, carbs, value, classification) {
    document.getElementById('tmb').textContent = `${Math.round(tmb)} kcal`;
    document.getElementById('tdee').textContent = `${Math.round(tdee)} kcal`;
    document.getElementById('calories').textContent = `${Math.round(calories)} kcal`;
    document.getElementById('calorie-explanation').textContent = explanation;
    
    document.getElementById('carbs').textContent = `${carbs}g`;
    document.getElementById('protein').textContent = `${protein}g`;
    document.getElementById('fat').textContent = `${fat}g`;
    
    const proteinPerc = Math.round((protein * 4) / calories * 100);
    const fatPerc = Math.round((fat * 9) / calories * 100);
    const carbsPerc = Math.round((carbs * 4) / calories * 100);
   
    
    document.getElementById('carbs-perc').textContent = carbsPerc;
    document.getElementById('protein-perc').textContent = proteinPerc;
    document.getElementById('fat-perc').textContent = fatPerc;
    document.getElementById('bmi-value').textContent = `${value} kg/m²`;
    document.getElementById('bmi-classification').textContent = `Classificação: ${classification}`;
    // Adicionar classe conforme classificação
    const bmiElement = document.getElementById('bmi-value');
    bmiElement.className = 'result-value ' + getBMIClass(parseFloat(value));
    
  }

  

  function getBMIClass(bmi) {
    if (bmi < 18.5) return 'underweight';
    if (bmi >= 18.5 && bmi < 25) return 'normal';
    if (bmi >= 25 && bmi < 30) return 'overweight';
    return 'obese';
  }

  function createCharts(tmb, tdee, calories, goal, carbs, protein, fat) {
    createCalorieChart(tmb, tdee, calories, goal);
    createMacroChart(carbs, protein, fat);
  }
  
  function showError(elementId, show) {
    document.getElementById(elementId).style.display = show ? 'block' : 'none';
  }

  
  
  // =============================================
  // FUNÇÕES DOS GRÁFICOS
  // =============================================
  
  function createCalorieChart(tmb, tdee, calories, goal) {
    const ctx = document.getElementById('calorieChart').getContext('2d');
    
    if (calorieChart) calorieChart.destroy();
    
    const { goalLabel, goalColor, borderColor } = getGoalChartSettings(goal);
    
    calorieChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['TMB (Repouso)', 'TDEE (Total Diário)', goalLabel],
        datasets: [{
          data: [tmb, tdee, calories],
          backgroundColor: ['#9b59b6', '#3498db', goalColor],
          borderColor: ['#8e44ad', '#2980b9', borderColor],
          borderWidth: 1
        }]
      },
      options: getChartOptions('Calorias (kcal)')
    });
  }
  
  function createMacroChart(carbs, protein, fat) {
    const ctx = document.getElementById('macroChart').getContext('2d');
    
    if (macroChart) macroChart.destroy();
    
    const proteinPerc = Math.round((protein * 4) / (carbs * 4 + protein * 4 + fat * 9) * 100);
    const fatPerc = Math.round((fat * 9) / (carbs * 4 + protein * 4 + fat * 9) * 100);
    const carbsPerc = Math.round((carbs * 4) / (carbs * 4 + protein * 4 + fat * 9) * 100);
    
    macroChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          `Carboidratos (${carbsPerc}%)`,
          `Proteínas (${proteinPerc}%)`,
          `Gorduras (${fatPerc}%)`
        ],
        datasets: [{
          data: [carbs, protein, fat],
          backgroundColor: ['#e74c3c', '#3498db', '#f39c12'],
          borderWidth: 1
        }]
      },
      options: getDoughnutOptions()
    });
  }
  
  // =============================================
  // FUNÇÕES DE CONFIGURAÇÃO DOS GRÁFICOS
  // =============================================
  
  function getGoalChartSettings(goal) {
    switch(goal) {
      case 'cut':
        return {
          goalLabel: 'Meta (Déficit)',
          goalColor: '#e74c3c',
          borderColor: '#c0392b'
        };
      case 'bulk':
        return {
          goalLabel: 'Meta (Superávit)',
          goalColor: '#2ecc71',
          borderColor: '#27ae60'
        };
      default:
        return {
          goalLabel: 'Meta (Manutenção)',
          goalColor: '#3498db',
          borderColor: '#2980b9'
        };
    }
  }
  
  function getChartOptions(yAxisTitle) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: context => `${context.parsed.y} kcal`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: { display: true, text: yAxisTitle }
        }
      }
    };
  }
  
  function getDoughnutOptions() {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        tooltip: {
          callbacks: {
            label: context => {
              const label = context.label || '';
              const value = context.raw || 0;
              return `${label}: ${value}g`;
            }
          }
        }
      },
      cutout: '65%'
    };
  }
  
  // =============================================
  // FUNÇÕES DE CONTROLE DAS ABAS
  // =============================================
  
  function switchTab(tabName) {
    // Esconder todas as abas
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Desativar todos os botões de aba
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    // Mostrar aba selecionada
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Ativar botão da aba selecionada
    event.currentTarget.classList.add('active');
    
    // Redesenhar gráficos quando a aba é trocada
    if (tabName === 'summary' && calorieChart) {
      calorieChart.update();
    } else if (tabName === 'macros' && macroChart) {
      macroChart.update();
    }
  }