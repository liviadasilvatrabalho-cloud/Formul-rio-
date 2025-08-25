import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building2, User, CheckCircle, AlertCircle, MapPin, Phone, Mail, FileText, Sparkles, Globe, Shield } from 'lucide-react';

interface PartnerFormData {
  personalidade: 'fisica' | 'juridica';
  razaoSocial: string;
  documento: string; // CNPJ ou CPF
  cep: string;
  uf: string;
  municipio: string;
  logradouro: string;
  numero: string;
  bairro: string;
  email: string;
  telefone: string;
  complemento: string;
  observacao: string;
}

interface FormErrors {
  [key: string]: string;
}

const PartnerForm: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PartnerFormData>({
    personalidade: 'juridica',
    razaoSocial: '',
    documento: '',
    cep: '',
    uf: '',
    municipio: '',
    logradouro: '',
    numero: '',
    bairro: '',
    email: '',
    telefone: '',
    complemento: '',
    observacao: ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [completedFields, setCompletedFields] = useState<Set<string>>(new Set());
  const [formProgress, setFormProgress] = useState(0);

  // Calcular progresso do formulário
  useEffect(() => {
    const requiredFields = ['razaoSocial', 'documento', 'cep', 'uf', 'municipio', 'logradouro', 'numero', 'bairro', 'email', 'telefone'];
    const filledFields = requiredFields.filter(field => formData[field as keyof PartnerFormData].trim() !== '');
    setFormProgress((filledFields.length / requiredFields.length) * 100);
  }, [formData]);

  // Máscaras
  const formatCNPJ = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 18);
  };

  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2')
      .substring(0, 14);
  };

  const formatCEP = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{5})(\d)/, '$1-$2')
      .substring(0, 9);
  };

  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .substring(0, 14);
  };

  // Validações
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateCNPJ = (cnpj: string) => {
    const numbers = cnpj.replace(/\D/g, '');
    return numbers.length === 14;
  };

  const validateCPF = (cpf: string) => {
    const numbers = cpf.replace(/\D/g, '');
    return numbers.length === 11;
  };

  const validateCEP = (cep: string) => {
    const numbers = cep.replace(/\D/g, '');
    return numbers.length === 8;
  };

  // Consulta CEP
  const consultarCEP = async (cep: string) => {
    if (!validateCEP(cep)) return;

    setIsLoadingCEP(true);
    try {
      const cepNumbers = cep.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepNumbers}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          logradouro: data.logradouro || '',
          bairro: data.bairro || '',
          municipio: data.localidade || '',
          uf: data.uf || ''
        }));
        toast({
          title: "✨ CEP consultado com sucesso!",
          description: "Endereço preenchido automaticamente.",
        });
      } else {
        toast({
          title: "🔍 CEP não encontrado",
          description: "Verifique o CEP informado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "⚠️ Erro ao consultar CEP",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCEP(false);
    }
  };

  // Consulta CNPJ
  const consultarCNPJ = async (cnpj: string) => {
    if (!validateCNPJ(cnpj)) return;

    setIsLoadingCNPJ(true);
    try {
      const cnpjNumbers = cnpj.replace(/\D/g, '');
      const response = await fetch(`https://www.receitaws.com.br/v1/cnpj/${cnpjNumbers}`);
      const data = await response.json();

      if (data.status === 'OK') {
        setFormData(prev => ({
          ...prev,
          razaoSocial: data.nome || ''
        }));
        toast({
          title: "🎉 CNPJ consultado com sucesso!",
          description: "Razão social preenchida automaticamente.",
        });
      } else {
        toast({
          title: "🔍 CNPJ não encontrado",
          description: "Verifique o CNPJ informado.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "⚠️ Erro ao consultar CNPJ",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  // Handlers
  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    let formattedValue = value;

    // Aplicar máscaras
    switch (field) {
      case 'documento':
        formattedValue = formData.personalidade === 'juridica' ? formatCNPJ(value) : formatCPF(value);
        break;
      case 'cep':
        formattedValue = formatCEP(value);
        break;
      case 'telefone':
        formattedValue = formatTelefone(value);
        break;
    }

    setFormData(prev => ({ ...prev, [field]: formattedValue }));

    // Marcar campo como preenchido
    if (formattedValue.trim()) {
      setCompletedFields(prev => new Set([...prev, field]));
    } else {
      setCompletedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(field);
        return newSet;
      });
    }

    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto consultas
    if (field === 'cep' && validateCEP(formattedValue)) {
      consultarCEP(formattedValue);
    }

    if (field === 'documento' && formData.personalidade === 'juridica' && validateCNPJ(formattedValue)) {
      consultarCNPJ(formattedValue);
    }
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    // Campos obrigatórios
    if (!formData.razaoSocial.trim()) newErrors.razaoSocial = 'Razão Social é obrigatória';
    if (!formData.documento.trim()) newErrors.documento = `${formData.personalidade === 'juridica' ? 'CNPJ' : 'CPF'} é obrigatório`;
    if (!formData.cep.trim()) newErrors.cep = 'CEP é obrigatório';
    if (!formData.uf.trim()) newErrors.uf = 'UF é obrigatória';
    if (!formData.municipio.trim()) newErrors.municipio = 'Município é obrigatório';
    if (!formData.logradouro.trim()) newErrors.logradouro = 'Logradouro é obrigatório';
    if (!formData.numero.trim()) newErrors.numero = 'Número é obrigatório';
    if (!formData.bairro.trim()) newErrors.bairro = 'Bairro é obrigatório';
    if (!formData.email.trim()) newErrors.email = 'Email é obrigatório';
    if (!formData.telefone.trim()) newErrors.telefone = 'Telefone é obrigatório';

    // Validações de formato
    if (formData.email && !validateEmail(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    if (formData.documento) {
      if (formData.personalidade === 'juridica' && !validateCNPJ(formData.documento)) {
        newErrors.documento = 'CNPJ inválido';
      }
      if (formData.personalidade === 'fisica' && !validateCPF(formData.documento)) {
        newErrors.documento = 'CPF inválido';
      }
    }

    if (formData.cep && !validateCEP(formData.cep)) {
      newErrors.cep = 'CEP inválido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "⚠️ Formulário inválido",
        description: "Corrija os erros antes de continuar.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Simular envio para API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "🎉 Parceiro cadastrado com sucesso!",
        description: "Os dados foram salvos no sistema.",
      });

      // Reset form
      setFormData({
        personalidade: 'juridica',
        razaoSocial: '',
        documento: '',
        cep: '',
        uf: '',
        municipio: '',
        logradouro: '',
        numero: '',
        bairro: '',
        email: '',
        telefone: '',
        complemento: '',
        observacao: ''
      });
      setCompletedFields(new Set());
    } catch (error) {
      toast({
        title: "❌ Erro ao cadastrar",
        description: "Tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldClassName = (field: string) => {
    const baseClass = "transition-all duration-normal bg-gradient-input border-border/50 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20";
    if (errors[field]) {
      return `${baseClass} border-destructive shadow-glow-destructive animate-pulse`;
    }
    if (completedFields.has(field)) {
      return `${baseClass} border-success/50 shadow-glow-success`;
    }
    return `${baseClass} focus:shadow-glow-primary`;
  };

  const getIconForField = (field: string) => {
    switch (field) {
      case 'cep':
      case 'logradouro':
      case 'numero':
      case 'bairro':
      case 'municipio':
      case 'uf':
        return <MapPin className="w-4 h-4" />;
      case 'telefone':
        return <Phone className="w-4 h-4" />;
      case 'email':
        return <Mail className="w-4 h-4" />;
      case 'observacao':
      case 'complemento':
        return <FileText className="w-4 h-4" />;
      default:
        return <Building2 className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-dark py-4 sm:py-8 px-3 sm:px-4 lg:px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-32 h-32 sm:w-72 sm:h-72 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 h-48 sm:w-96 sm:h-96 bg-accent/10 rounded-full blur-3xl"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
            <div className="p-2 sm:p-3 bg-gradient-primary rounded-full shadow-glow-primary">
              <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-hero bg-clip-text text-transparent text-center">
              Cadastro de Parceiros
            </h1>
            <div className="p-2 sm:p-3 bg-gradient-primary rounded-full shadow-glow-primary">
              <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-primary-foreground" />
            </div>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg mb-4 sm:mb-6 px-4">
            Sistema moderno de cadastro com validação inteligente
          </p>
          
          {/* Progress Bar */}
          <div className="max-w-sm sm:max-w-md mx-auto mb-4 sm:mb-6 px-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs sm:text-sm text-muted-foreground">Progresso</span>
              <span className="text-xs sm:text-sm font-semibold text-primary">{Math.round(formProgress)}%</span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2 sm:h-3 shadow-inner">
              <div 
                className="bg-gradient-primary h-2 sm:h-3 rounded-full transition-all duration-slow shadow-glow-primary"
                style={{ width: `${formProgress}%` }}
              ></div>
            </div>
          </div>
        </div>

        <Card className="bg-gradient-card border-border/50 shadow-2xl backdrop-blur-sm animate-scale-in relative overflow-hidden mx-2 sm:mx-0">
          {/* Card decoration */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-primary"></div>
          
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
            {/* Tipo de Personalidade */}
            <div className="space-y-4 animate-fade-in">
              <Label className="text-lg font-semibold flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Personalidade
              </Label>
              <RadioGroup
                value={formData.personalidade}
                onValueChange={(value) => {
                  setFormData(prev => ({ 
                    ...prev, 
                    personalidade: value as 'fisica' | 'juridica',
                    documento: '',
                    razaoSocial: ''
                  }));
                }}
                className="flex flex-col sm:flex-row gap-4 sm:gap-8"
              >
                <div className="flex items-center space-x-3 group cursor-pointer p-3 sm:p-4 rounded-lg bg-gradient-input border border-border/50 hover:border-primary/50 transition-all duration-normal hover:shadow-glow-soft w-full sm:w-auto">
                  <RadioGroupItem value="juridica" id="juridica" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="juridica" className="flex items-center gap-2 cursor-pointer group-hover:text-primary transition-colors">
                    <Building2 className="w-4 h-4" />
                    Pessoa Jurídica
                  </Label>
                </div>
                <div className="flex items-center space-x-3 group cursor-pointer p-3 sm:p-4 rounded-lg bg-gradient-input border border-border/50 hover:border-primary/50 transition-all duration-normal hover:shadow-glow-soft w-full sm:w-auto">
                  <RadioGroupItem value="fisica" id="fisica" className="border-primary data-[state=checked]:bg-primary data-[state=checked]:border-primary" />
                  <Label htmlFor="fisica" className="flex items-center gap-2 cursor-pointer group-hover:text-primary transition-colors">
                    <User className="w-4 h-4" />
                    Pessoa Física
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Razão Social */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="razaoSocial" className="flex items-center gap-2">
                  {getIconForField('razaoSocial')}
                  Razão Social *
                  {completedFields.has('razaoSocial') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <div className="relative">
                  <Input
                    id="razaoSocial"
                    value={formData.razaoSocial}
                    onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                    className={getFieldClassName('razaoSocial')}
                    placeholder="Nome ou razão social"
                  />
                </div>
                {errors.razaoSocial && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.razaoSocial}
                  </p>
                )}
              </div>

              {/* CNPJ/CPF */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="documento" className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  {formData.personalidade === 'juridica' ? 'CNPJ' : 'CPF'} *
                  {isLoadingCNPJ && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {completedFields.has('documento') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="documento"
                  value={formData.documento}
                  onChange={(e) => handleInputChange('documento', e.target.value)}
                  className={getFieldClassName('documento')}
                  placeholder={formData.personalidade === 'juridica' ? '00.000.000/0000-00' : '000.000.000-00'}
                />
                {errors.documento && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.documento}
                  </p>
                )}
              </div>

              {/* CEP */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="cep" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  CEP *
                  {isLoadingCEP && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
                  {completedFields.has('cep') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => handleInputChange('cep', e.target.value)}
                  className={getFieldClassName('cep')}
                  placeholder="00000-000"
                />
                {errors.cep && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.cep}
                  </p>
                )}
              </div>

              {/* UF */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="uf" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  UF *
                  {completedFields.has('uf') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="uf"
                  value={formData.uf}
                  onChange={(e) => handleInputChange('uf', e.target.value.toUpperCase())}
                  className={getFieldClassName('uf')}
                  placeholder="SP"
                  maxLength={2}
                />
                {errors.uf && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.uf}
                  </p>
                )}
              </div>

              {/* Município */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="municipio" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Município *
                  {completedFields.has('municipio') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="municipio"
                  value={formData.municipio}
                  onChange={(e) => handleInputChange('municipio', e.target.value)}
                  className={getFieldClassName('municipio')}
                  placeholder="Nome da cidade"
                />
                {errors.municipio && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.municipio}
                  </p>
                )}
              </div>

              {/* Logradouro */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="logradouro" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Logradouro *
                  {completedFields.has('logradouro') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="logradouro"
                  value={formData.logradouro}
                  onChange={(e) => handleInputChange('logradouro', e.target.value)}
                  className={getFieldClassName('logradouro')}
                  placeholder="Nome da rua/avenida"
                />
                {errors.logradouro && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.logradouro}
                  </p>
                )}
              </div>

              {/* Número */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="numero" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Número *
                  {completedFields.has('numero') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="numero"
                  value={formData.numero}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className={getFieldClassName('numero')}
                  placeholder="Número"
                />
                {errors.numero && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.numero}
                  </p>
                )}
              </div>

              {/* Bairro */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="bairro" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Bairro *
                  {completedFields.has('bairro') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="bairro"
                  value={formData.bairro}
                  onChange={(e) => handleInputChange('bairro', e.target.value)}
                  className={getFieldClassName('bairro')}
                  placeholder="Nome do bairro"
                />
                {errors.bairro && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.bairro}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email *
                  {completedFields.has('email') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={getFieldClassName('email')}
                  placeholder="email@exemplo.com"
                />
                {errors.email && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="telefone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Telefone *
                  {completedFields.has('telefone') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => handleInputChange('telefone', e.target.value)}
                  className={getFieldClassName('telefone')}
                  placeholder="(00) 0000-0000"
                />
                {errors.telefone && (
                  <p className="text-destructive text-sm flex items-center gap-1 animate-fade-in">
                    <AlertCircle className="w-4 h-4" />
                    {errors.telefone}
                  </p>
                )}
              </div>

              {/* Complemento */}
              <div className="space-y-2 lg:col-span-2 animate-fade-in">
                <Label htmlFor="complemento" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Complemento
                  {completedFields.has('complemento') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Input
                  id="complemento"
                  value={formData.complemento}
                  onChange={(e) => handleInputChange('complemento', e.target.value)}
                  className={getFieldClassName('complemento')}
                  placeholder="Apartamento, sala, etc."
                />
              </div>

              {/* Observação */}
              <div className="space-y-2 lg:col-span-2 animate-fade-in">
                <Label htmlFor="observacao" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Observação
                  {completedFields.has('observacao') && <CheckCircle className="w-4 h-4 text-success" />}
                </Label>
                <Textarea
                  id="observacao"
                  value={formData.observacao}
                  onChange={(e) => handleInputChange('observacao', e.target.value)}
                  className={getFieldClassName('observacao')}
                  placeholder="Observações adicionais..."
                  rows={4}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-4 sm:pt-6">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full sm:max-w-md bg-gradient-primary hover:opacity-90 text-primary-foreground font-semibold py-4 sm:py-6 px-6 sm:px-8 text-base sm:text-lg shadow-glow-primary transition-all duration-normal hover:shadow-glow-primary-intense disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                    <span className="hidden sm:inline">Cadastrando...</span>
                    <span className="sm:hidden">Enviando...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    <span className="hidden sm:inline">Cadastrar Parceiro</span>
                    <span className="sm:hidden">Cadastrar</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>

      </div>
    </div>
  );
};

export default PartnerForm;