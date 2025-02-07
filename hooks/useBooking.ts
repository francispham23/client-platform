import { useSupabase } from "../lib/supabase";

// Example of how to use Supabase in a component or service
export const useBooking = () => {
  const supabase = useSupabase();

  const createItem = async (data: any) => {
    const { data: result, error } = await supabase
      .from("booking")
      .insert(data)
      .select()
      .single();

    if (error) throw error;
    return result;
  };

  const getItems = async () => {
    const { data, error } = await supabase.from("booking").select("*");

    if (error) throw error;
    return data;
  };

  const updateItem = async (id: string, data: any) => {
    const { data: result, error } = await supabase
      .from("booking")
      .update(data)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return result;
  };

  const deleteItem = async (id: string) => {
    const { error } = await supabase.from("booking").delete().eq("id", id);

    if (error) throw error;
  };

  return {
    createItem,
    getItems,
    updateItem,
    deleteItem,
  };
};
