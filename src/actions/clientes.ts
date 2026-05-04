"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAction } from "@/lib/logger";

const MODULO = "CLIENTES";

export async function getClientes(searchQuery?: string) {
  try {
    const whereClause = searchQuery 
      ? {
          OR: [
            { Nome: { contains: searchQuery, mode: "insensitive" as const } },
            { CPFCNPJ: { contains: searchQuery } }
          ]
        }
      : {};

    const clientes = await prisma.clientes.findMany({
      where: whereClause,
      include: {
        Endereco: true
      },
      orderBy: { Nome: "asc" },
    });

    // Serialização: converter Decimal para Number
    const serializedClientes = clientes.map(c => ({
      ...c,
      LimiteCredito: c.LimiteCredito ? Number(c.LimiteCredito) : null
    }));

    return { success: true, data: serializedClientes };
  } catch (error) {
    console.error("Erro ao buscar clientes:", error);
    return { success: false, error: "Falha ao buscar clientes." };
  }
}

export async function getClienteById(id: number) {
  try {
    const cliente = await prisma.clientes.findUnique({
      where: { Id: id },
      include: {
        Endereco: true
      }
    });
    
    // As in Next 14, Decimal doesn't serialize trivially to Client components sometimes,
    // but Prisma v5 + Server Actions handles Decimal to plain JS translation via Next's new cache.
    // Converting safely:
    if (cliente) {
        return { 
            success: true, 
            data: {
               ...cliente,
               LimiteCredito: cliente.LimiteCredito ? Number(cliente.LimiteCredito) : null
            }
        };
    }
    
    return { success: false, error: "Cliente não encontrado." };
  } catch (error) {
    return { success: false, error: "Falha na leitura." };
  }
}

export async function createCliente(formData: FormData) {
  const nome = formData.get("Nome") as string;
  try {
    const data = {
      TipoCliente: formData.get("TipoCliente") as string || "F",
      Ativo: formData.get("Ativo") === "true",
      Nome: nome,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneComercial: formData.get("TelefoneComercial") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Fax: formData.get("Fax") as string | null,
      Site: formData.get("Site") as string | null,
      VendedorResponsavel: formData.get("VendedorResponsavel") as string || "Admin",
      LimiteCredito: formData.get("LimiteCredito") ? Number(formData.get("LimiteCredito")) : null,
      PermitirExcederLimite: formData.get("PermitirExcederLimite") === "on",
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.clientes.create({
      data
    });

    await logAction("Criar Cliente", MODULO, `Cliente '${nome}' cadastrado com sucesso.`);
    revalidatePath("/cadastros/clientes");
  } catch (error) {
    console.error("Erro ao inserir:", error);
    await logAction("Criar Cliente", MODULO, `Falha ao cadastrar cliente '${nome}': ${error}`, "ERRO");
    return { success: false, error: "Falha ao gravar cliente." };
  }

  // Redirect runs outside try/catch to work properly with Next.js bounds
  redirect("/cadastros/clientes");
}

export async function updateCliente(id: number, formData: FormData) {
  const nome = formData.get("Nome") as string;
  try {
    const data = {
      TipoCliente: formData.get("TipoCliente") as string || "F",
      Ativo: formData.get("Ativo") === "true",
      Nome: nome,
      Email: formData.get("Email") as string | null,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      TelefoneComercial: formData.get("TelefoneComercial") as string | null,
      TelefoneCelular: formData.get("TelefoneCelular") as string | null,
      Fax: formData.get("Fax") as string | null,
      Site: formData.get("Site") as string | null,
      VendedorResponsavel: formData.get("VendedorResponsavel") as string || "Admin",
      LimiteCredito: formData.get("LimiteCredito") ? Number(formData.get("LimiteCredito")) : null,
      PermitirExcederLimite: formData.get("PermitirExcederLimite") === "on",
      Observacoes: formData.get("Observacoes") as string | null,
    };

    await prisma.clientes.update({
      where: { Id: id },
      data
    });

    await logAction("Atualizar Cliente", MODULO, `Cliente '${nome}' (ID: ${id}) atualizado.`);
    revalidatePath("/cadastros/clientes");
  } catch (error) {
    await logAction("Atualizar Cliente", MODULO, `Falha ao atualizar cliente '${nome}' (ID: ${id}): ${error}`, "ERRO");
    return { success: false, error: "Falha ao atualizar." };
  }
  
  redirect("/cadastros/clientes");
}

export async function deleteCliente(id: number) {
  try {
    await prisma.clientes.delete({
      where: { Id: id }
    });
    await logAction("Deletar Cliente", MODULO, `Cliente ID: ${id} removido.`);
    revalidatePath("/cadastros/clientes");
    return { success: true };
  } catch (error) {
    await logAction("Deletar Cliente", MODULO, `Falha ao remover cliente ID: ${id}: ${error}`, "ERRO");
    return { success: false, error: "Falha ao deletar." };
  }
}
export async function quickCreateCliente(formData: FormData) {
  const nome = formData.get("Nome") as string;
  try {
    const data = {
      TipoCliente: formData.get("TipoCliente") as string || "F",
      Ativo: true,
      Nome: nome,
      CPFCNPJ: formData.get("CPFCNPJ") as string | null,
      Telefone: formData.get("Telefone") as string | null,
      Email: formData.get("Email") as string | null,
    };

    const newCliente = await prisma.clientes.create({ data });
    revalidatePath("/cadastros/clientes");
    return { success: true, data: newCliente };
  } catch (error) {
    console.error("Erro no quickCreateCliente:", error);
    return { success: false, error: "Falha ao gravar cliente rapidamente." };
  }
}
