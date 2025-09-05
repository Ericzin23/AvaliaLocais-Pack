import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { theme } from '../theme';
import { register } from '../services/api';

const ALLOWED_DOMAINS = ['gmail.com','outlook.com','hotmail.com','yahoo.com']; 
// Dica: quer aceitar qualquer domínio? Troque pela linha abaixo:
// const ALLOWED_DOMAINS = null; // aceita qualquer e-mail

function isEmailValid(email){
  if(!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if(!re.test(email)) return false;
  if (ALLOWED_DOMAINS && ALLOWED_DOMAINS.length){
    const part = email.split('@')[1]?.toLowerCase();
    if(!part || !ALLOWED_DOMAINS.includes(part)) return false;
  }
  return true;
}
function passwordScore(pwd){
  if(!pwd) return 0;
  const strong = /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  return strong.test(pwd) ? 3 : pwd.length>=6 ? 2 : 1;
}
function passwordIssues(p){
  return [
    { ok: p?.length>=8, text:'mínimo 8 caracteres' },
    { ok: /[A-Z]/.test(p||''), text:'1 letra maiúscula' },
    { ok: /\d/.test(p||''),    text:'1 número' },
    { ok: /[^A-Za-z0-9]/.test(p||''), text:'1 símbolo' }
  ];
}

export default function RegisterScreen({ navigation }){
  const [nome,setNome]           = useState('');
  const [email,setEmail]         = useState('');
  const [nasc,setNasc]           = useState('2000-01-01');
  const [genero,setGenero]       = useState('Outro'); // Masculino | Feminino | Outro
  const [senha,setSenha]         = useState('');
  const [submitting,setSubmitting]=useState(false);
  const [errors,setErrors]       = useState({});

  const score = useMemo(()=>passwordScore(senha),[senha]);
  const crit  = useMemo(()=>passwordIssues(senha),[senha]);

  const validate = () => {
    const e = {};
    if(!nome?.trim()) e.nome = 'Informe seu nome completo';
    if(!isEmailValid(email)) {
      e.email = ALLOWED_DOMAINS
        ? `E-mail inválido. Use um domínio suportado (${ALLOWED_DOMAINS.join(', ')}).`
        : 'E-mail inválido';
    }
    if(!nasc?.match(/^\d{4}-\d{2}-\d{2}$/)) e.nasc = 'Use o formato YYYY-MM-DD';
    if(score<3) e.senha = 'Senha fraca. Atenda a todos os critérios.';
    if(!['Masculino','Feminino','Outro'].includes(genero)) e.genero = 'Escolha uma opção';
    setErrors(e);
    return Object.keys(e).length===0;
  };

  const onRegister = async () => {
    if(!validate()) return;
    try{
      setSubmitting(true);
      const payload = { nome, email, senha, dataNascimento:nasc, genero };
      await register(payload);
      Alert.alert('Sucesso','Conta criada! Faça login.');
      navigation.goBack();
    }catch(e){
      const msg = typeof e?.response?.data === 'string'
        ? e.response.data
        : e?.response?.data?.message || e?.message || 'Não foi possível cadastrar.';
      // Se o backend mandar {code, field, message}, mapeie pro campo:
      const field = e?.response?.data?.field;
      if(field) setErrors(prev => ({...prev, [field]: msg}));
      else Alert.alert('Erro', msg);
    }finally{
      setSubmitting(false);
    }
  };

  const Chip = ({label, active, onPress}) => (
    <TouchableOpacity onPress={onPress} style={[s.chip, active && s.chipActive]}>
      <Text style={[s.chipText, active && s.chipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <Text style={s.title}>Criar conta</Text>

      <TextInput style={s.input} placeholder='Nome completo' placeholderTextColor="#888"
        value={nome} onChangeText={(t)=>{setNome(t); setErrors(p=>({...p,nome:undefined}))}} />
      {errors.nome && <Text style={s.err}>{errors.nome}</Text>}

      <TextInput style={s.input} placeholder='E-mail' placeholderTextColor="#888" autoCapitalize='none'
        keyboardType='email-address' value={email}
        onChangeText={(t)=>{setEmail(t); setErrors(p=>({...p,email:undefined}))}} />
      {errors.email && <Text style={s.err}>{errors.email}</Text>}

      <TextInput style={s.input} placeholder='Data de nascimento (YYYY-MM-DD)' placeholderTextColor="#888"
        value={nasc} onChangeText={(t)=>{setNasc(t); setErrors(p=>({...p,nasc:undefined}))}} />
      {errors.nasc && <Text style={s.err}>{errors.nasc}</Text>}

      <Text style={s.label}>Gênero</Text>
      <View style={s.row}>
        {['Masculino','Feminino','Outro'].map(opt => (
          <Chip key={opt} label={opt} active={genero===opt} onPress={()=>{setGenero(opt); setErrors(p=>({...p,genero:undefined}))}} />
        ))}
      </View>
      {errors.genero && <Text style={s.err}>{errors.genero}</Text>}

      <TextInput style={s.input} placeholder='Senha forte' placeholderTextColor="#888" secureTextEntry
        value={senha} onChangeText={(t)=>{setSenha(t); setErrors(p=>({...p,senha:undefined}))}} />
      <View style={s.barWrap}>
        <View style={[s.bar, score>=1 && {backgroundColor:'#EF4444'}]} />
        <View style={[s.bar, score>=2 && {backgroundColor:'#F59E0B'}]} />
        <View style={[s.bar, score>=3 && {backgroundColor:'#22C55E'}]} />
      </View>
      <View style={{marginBottom:8}}>
        {crit.map((c,i)=><Text key={i} style={{color:c.ok? '#22C55E':'#aaa', fontSize:12}}>• {c.text}</Text>)}
      </View>
      {errors.senha && <Text style={s.err}>{errors.senha}</Text>}

      <TouchableOpacity disabled={submitting} style={[s.btn, submitting && {opacity:.6}]} onPress={onRegister}>
        <Text style={s.btnText}>{submitting?'Enviando...':'Cadastrar'}</Text>
      </TouchableOpacity>

      <Text style={{color:'#7f8', marginTop:12, fontSize:12}}>
        Dica: se aparecer “Falha de conexão”, verifique se o backend em http://SEU-IP:8080 está rodando e se o arquivo mobile/src/services/api.js aponta para ele.
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1, backgroundColor:theme.colors.bg, padding:24},
  title:{color:theme.colors.text, fontSize:22, marginBottom:12},
  label:{color:'#ccc', marginTop:6, marginBottom:4},
  row:{flexDirection:'row', gap:8, marginBottom:8, flexWrap:'wrap'},
  input:{backgroundColor:theme.colors.card, color:theme.colors.text, padding:14, borderRadius:12, marginBottom:6},
  err:{color:theme.colors.danger, marginBottom:6},
  btn:{backgroundColor:theme.colors.primary, padding:14, borderRadius:12, alignItems:'center', marginTop:10},
  btnText:{color:'#fff', fontWeight:'bold'},
  barWrap:{flexDirection:'row', gap:6, marginVertical:8},
  bar:{flex:1, height:6, backgroundColor:'#333', borderRadius:4},
  chip:{paddingVertical:6, paddingHorizontal:10, borderRadius:20, backgroundColor:'#1a1a22'},
  chipActive:{backgroundColor:theme.colors.primary},
  chipText:{color:'#aaa'}, chipTextActive:{color:'#fff'},
});
