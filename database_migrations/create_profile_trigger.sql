-- Trigger pour créer automatiquement un profil lors de l'inscription
-- Ce trigger s'exécute après la création d'un utilisateur dans auth.users
-- Adapté au schéma exact de la table profiles d'Amani Finance

-- Fonction qui crée le profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    organization,
    avatar_url,
    roles,
    phone,
    location,
    linkedin,
    twitter,
    bio,
    preferences,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'organization', NULL),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NULL),
    ARRAY['user'::text],  -- Rôle par défaut
    NULL,  -- phone
    NULL,  -- location
    NULL,  -- linkedin
    NULL,  -- twitter
    NULL,  -- bio
    '{}'::jsonb,  -- preferences vide par défaut
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Commentaire
COMMENT ON FUNCTION public.handle_new_user() IS 'Crée automatiquement un profil dans la table profiles lors de l''inscription d''un nouvel utilisateur';
