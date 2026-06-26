export const whatsappUtils = {
  /**
   * Formata número removendo caracteres que não sejam números
   * Garante o 55 (Brasil) no começo se não tiver
   */
  formatPhone(phone: string): string {
    let cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length === 10 || cleanPhone.length === 11) {
      cleanPhone = "55" + cleanPhone;
    }
    return cleanPhone;
  },

  /**
   * Gera a URL do WhatsApp Web / App
   */
  generateLink(phone: string, message: string): string {
    const formattedPhone = this.formatPhone(phone);
    const encodedMessage = encodeURIComponent(message);
    return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
  },

  /**
   * Templates de mensagens
   */
  templates: {
    birthday: (clientName: string) => 
      `Olá *${clientName}*, tudo bem? 🎉\n\nHoje é o seu aniversário e a equipe da barbearia passando para te desejar muita paz, saúde e sucesso!\n\nQue tal dar um trato no visual pra comemorar? Aguardamos você! ✂️🔥`,
    
    reminder: (clientName: string, date: string, time: string, serviceName: string) => 
      `Olá *${clientName}*, beleza?\n\nPassando para confirmar o seu agendamento de *${serviceName}* conosco amanhã, dia *${date}* às *${time}*.\n\nPodemos confirmar sua presença? 👍`,

    recovery: (clientName: string) => 
      `Fala *${clientName}*, sumido! Tudo certo?\n\nFaz um tempinho que você não vem dar um talento no visual com a gente. Saudade de você por aqui!\n\nBora agendar um horário essa semana? 💈🚀`
  }
};
